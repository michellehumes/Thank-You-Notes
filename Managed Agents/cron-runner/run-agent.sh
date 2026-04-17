#!/bin/bash
# ============================================================
# Managed Agent Runner v2 -- Event-Driven Operations OS
# Runs agents via Claude Code CLI (OAuth/Max plan -- no API credits)
#
# Flow:
#   1. Emit agent_run_started event
#   2. Run Claude agent (generates outputs + event payload)
#   3. Emit agent_run_completed or agent_run_failed event
#   4. Run rules engine to process new events
#   5. Run health check + dashboard rebuild
#
# Usage: ./run-agent.sh <agent-name> [scan-type]
# ============================================================

set -uo pipefail

AGENT_NAME="${1:-}"
SCAN_TYPE="${2:-daily}"
AGENTS_DIR="/Users/michellehumes/Managed Agents"
AGENT_DEFS="$AGENTS_DIR/agents"
LOG_DIR="$AGENTS_DIR/logs"
STATE_DIR="$AGENTS_DIR/state"
OUTPUT_DIR="$AGENTS_DIR/outputs"
SCRIPTS_DIR="$AGENTS_DIR/scripts"
PYTHON="/usr/bin/python3"
CLAUDE="/Users/michellehumes/.local/bin/claude"
TIMESTAMP=$(date '+%Y-%m-%dT%H:%M:%S%z')
DATE=$(date '+%Y-%m-%d')
TIME=$(date '+%H%M')
RUN_ID="${AGENT_NAME}-${DATE}-${TIME}-$$"

if [ -z "$AGENT_NAME" ]; then
  echo "Usage: $0 <agent-name> [scan-type]"
  echo "Agents: affiliate, career, etsy, fertility, gmail, life-ops"
  echo "Scan types: daily, morning, noon, afternoon, evening"
  exit 1
fi

# Ensure directories exist
mkdir -p "$LOG_DIR" "$STATE_DIR" "$OUTPUT_DIR/$AGENT_NAME/$DATE"

LOG_FILE="$LOG_DIR/cron_${AGENT_NAME}_${SCAN_TYPE}.log"
RUN_OUTPUT="$OUTPUT_DIR/$AGENT_NAME/$DATE/run-${TIME}.json"

echo "[$TIMESTAMP] Starting $AGENT_NAME ($SCAN_TYPE) run_id=$RUN_ID" >> "$LOG_FILE"

# ── Emit agent_run_started event ─────────────────────────────
$PYTHON -c "
import sys; sys.path.insert(0, '$AGENTS_DIR')
from core.event_schema import create_event, append_event
evt = create_event(
    agent='$AGENT_NAME',
    run_id='$RUN_ID',
    event_type='agent_run_started',
    entity_type='other',
    entity_id='$RUN_ID',
    title='$AGENT_NAME $SCAN_TYPE run started',
    summary='Agent $AGENT_NAME started $SCAN_TYPE scan',
    status='info',
    priority='low',
    auto_safe=True,
    action_required=False
)
append_event(evt)
" 2>> "$LOG_FILE" || true

# ── Event contract instruction ───────────────────────────────
EVENT_CONTRACT="

IMPORTANT -- STRUCTURED EVENT OUTPUT CONTRACT:
After completing your work, you MUST write a JSON file to $RUN_OUTPUT with this structure:
{
  \"run_id\": \"$RUN_ID\",
  \"agent\": \"$AGENT_NAME\",
  \"started_at\": \"$TIMESTAMP\",
  \"completed_at\": \"<ISO timestamp when done>\",
  \"status\": \"success|warning|failed\",
  \"summary\": \"<1-2 sentence summary of what was accomplished>\",
  \"events\": [
    {
      \"event_type\": \"<type from the event catalog>\",
      \"entity_type\": \"<job|etsy_listing|affiliate_article|email|fertility_cycle|etc>\",
      \"entity_id\": \"<unique identifier>\",
      \"title\": \"<short title>\",
      \"summary\": \"<what happened>\",
      \"status\": \"new|updated|completed|failed|blocked|queued|info\",
      \"priority\": \"high|medium|low\",
      \"review_required\": false,
      \"data\": {}
    }
  ],
  \"errors\": []
}

Event type catalog:
CAREER: new_job_found, job_status_changed, new_fractional_found, outreach_draft_created, recruiter_email_detected, pipeline_health_computed
ETSY: etsy_product_idea_created, etsy_product_package_created, etsy_listing_ready, etsy_customer_message_detected, etsy_listing_metrics_updated
GMAIL: important_email_detected, gmail_draft_created, recruiter_email_handoff_created
FERTILITY: fertility_cycle_updated, fertility_mode_changed, ovulation_window_updated
AFFILIATE: affiliate_article_created, affiliate_article_published, affiliate_performance_signal
LIFE-OPS: life_ops_briefing_created, dashboard_refresh_requested, system_alert_created, decision_needed_created

You MUST create this file even if the run had no significant events (use an empty events array).
Write all your normal outputs and logs as usual -- this is IN ADDITION to your existing behavior.
"

# ── Check for pending instructions ──────────────────────────
INSTRUCTIONS_DIR="$AGENTS_DIR/data/instructions/$AGENT_NAME"
INSTRUCTION_BLOCK=""
if [ -d "$INSTRUCTIONS_DIR" ]; then
  PENDING_FILES=$(find "$INSTRUCTIONS_DIR" -name "*.json" -newer /dev/null 2>/dev/null)
  for ifile in $PENDING_FILES; do
    STATUS=$($PYTHON -c "import json; d=json.load(open('$ifile')); print(d.get('status',''))" 2>/dev/null || echo "")
    if [ "$STATUS" = "pending" ]; then
      INSTRUCTION_BLOCK="$INSTRUCTION_BLOCK
--- QUEUED INSTRUCTION (from $ifile) ---
$(cat "$ifile")
--- END INSTRUCTION ---
"
    fi
  done
fi

if [ -n "$INSTRUCTION_BLOCK" ]; then
  INSTRUCTION_PROMPT="

PRIORITY INSTRUCTIONS -- EXECUTE THESE FIRST:
The following specific tasks were approved in the Action Queue. Execute each one before running your normal scan. After completing each instruction, update its status to 'completed' by editing the JSON file and setting \"status\": \"completed\" and adding \"completed_at\": \"<timestamp>\".
$INSTRUCTION_BLOCK
After completing all instructions above, proceed with your normal scan."
else
  INSTRUCTION_PROMPT=""
fi

# ── Build agent prompt ───────────────────────────────────────
build_prompt() {
  local shared_context="$AGENT_DEFS/SHARED_CONTEXT.md"
  local agent_md="$AGENT_DEFS/$AGENT_NAME/AGENT.md"

  case "$AGENT_NAME" in
    affiliate)
      echo "You are the Affiliate CEO Agent. Read $shared_context and $agent_md then execute your daily scale mode cycle. Produce 2 articles for toolshedtested.com. Update state files in $AGENTS_DIR/data/affiliate/. Log to $LOG_DIR/affiliate_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
      ;;
    career)
      case "$SCAN_TYPE" in
        morning|daily)
          echo "You are the Job Search Agent. Read $shared_context and $agent_md then execute the MORNING scan: full pipeline review, new job sourcing (remote only, \$175K floor, VP/Director), follow-up generation. Update $AGENTS_DIR/data/job-tracker/jobs.csv. Log to $LOG_DIR/career_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
          ;;
        noon)
          echo "You are the Job Search Agent. Read $shared_context and $agent_md then execute the MIDDAY scan: check for new recruiter responses, web search for new job postings (remote only, \$175K floor, VP/Director). Only capture NET NEW roles. Update jobs.csv. Log to $LOG_DIR/career_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
          ;;
        afternoon)
          echo "You are the Job Search Agent. Read $shared_context and $agent_md then execute the AFTERNOON scan: new postings check, end-of-day follow-up queue. Remote only, \$175K floor. Update jobs.csv. Log to $LOG_DIR/career_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
          ;;
        evening)
          echo "You are the Job Search Agent. Read $shared_context and $agent_md then execute the EVENING scan: after-hours postings, pipeline health assessment (GREEN/YELLOW/RED). Update jobs.csv. Log to $LOG_DIR/career_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
          ;;
      esac
      ;;
    etsy)
      echo "You are the Etsy CEO Agent. Read $shared_context and $agent_md then execute your daily cycle. Check orders, optimize listings, produce new digital products if needed. Update $AGENTS_DIR/agents/MEMORY.md. Also write structured metrics to $AGENTS_DIR/data/etsy/metrics.json (revenue, orders, visits, CVR, AOV, active listings, ads data, reviews). Log to $LOG_DIR/etsy_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
      ;;
    fertility)
      echo "You are the Fertility Intelligence Agent. Read $shared_context and $agent_md then execute your daily cycle. Update cycle day, phase, predictions. Check for any symptom or BBT data. Update $AGENTS_DIR/data/fertility/state.json and current_cycle.json. Log to $LOG_DIR/fertility_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
      ;;
    gmail)
      echo "You are the Gmail Operator. Read $shared_context and $agent_md then triage the inbox. Use Gmail MCP tools to search unread messages. Categorize by priority, draft replies for important emails, flag security issues. Update $AGENTS_DIR/data/email-log/email_summary.json. Log to $LOG_DIR/gmail_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
      ;;
    life-ops)
      case "$SCAN_TYPE" in
        morning|daily)
          echo "You are the Life Ops Agent -- Michelle's chief of staff. Read $shared_context and $agent_md then execute the MORNING run. Read canonical state from $STATE_DIR/system_state.json, $STATE_DIR/review_queue.json, and recent structured outputs in $OUTPUT_DIR/. Produce morning intelligence briefing. Write briefing to $OUTPUT_DIR/life-ops/$DATE/morning-briefing.md. Log to $LOG_DIR/life_tracker_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
          ;;
        evening)
          echo "You are the Life Ops Agent -- Michelle's chief of staff. Read $shared_context and $agent_md then execute the EVENING run. Read canonical state from $STATE_DIR/system_state.json, $STATE_DIR/review_queue.json, and recent structured outputs in $OUTPUT_DIR/. Day capture: what completed, what progressed, what stalled. Produce evening briefing + tomorrow priorities. Write to $OUTPUT_DIR/life-ops/$DATE/evening-briefing.md. Log to $LOG_DIR/life_tracker_log.txt. $EVENT_CONTRACT $INSTRUCTION_PROMPT"
          ;;
      esac
      ;;
    *)
      echo "Unknown agent: $AGENT_NAME"
      exit 1
      ;;
  esac
}

PROMPT=$(build_prompt)

# ── Run Claude agent ─────────────────────────────────────────
$CLAUDE -p "$PROMPT" \
  --allowedTools "Read,Write,Edit,Bash,Glob,Grep,WebSearch,WebFetch,mcp__claude_ai_Gmail__gmail_search_messages,mcp__claude_ai_Gmail__gmail_read_message,mcp__claude_ai_Gmail__gmail_create_draft" \
  >> "$LOG_FILE" 2>&1

EXIT_CODE=$?
FINISH_TIMESTAMP=$(date '+%Y-%m-%dT%H:%M:%S%z')

echo "[$FINISH_TIMESTAMP] Agent finished with exit code $EXIT_CODE" >> "$LOG_FILE"

# ── Parse agent output and emit events ───────────────────────
if [ $EXIT_CODE -eq 0 ] && [ -f "$RUN_OUTPUT" ]; then
  # Agent produced structured output -- parse events into events.jsonl
  $PYTHON -c "
import sys, json; sys.path.insert(0, '$AGENTS_DIR')
from core.event_schema import create_event, append_event

with open('$RUN_OUTPUT') as f:
    run_data = json.load(f)

for evt_data in run_data.get('events', []):
    evt = create_event(
        agent='$AGENT_NAME',
        run_id='$RUN_ID',
        event_type=evt_data.get('event_type', 'info'),
        entity_type=evt_data.get('entity_type', 'other'),
        entity_id=evt_data.get('entity_id', ''),
        title=evt_data.get('title', ''),
        summary=evt_data.get('summary', ''),
        status=evt_data.get('status', 'info'),
        priority=evt_data.get('priority', 'medium'),
        review_required=evt_data.get('review_required', False),
        auto_safe=not evt_data.get('review_required', False),
        data=evt_data.get('data', {}),
        source_file='$RUN_OUTPUT'
    )
    try:
        append_event(evt)
    except Exception as e:
        print(f'Warning: failed to append event: {e}', file=sys.stderr)

# Emit agent_run_completed
completed = create_event(
    agent='$AGENT_NAME',
    run_id='$RUN_ID',
    event_type='agent_run_completed',
    entity_type='other',
    entity_id='$RUN_ID',
    title='$AGENT_NAME $SCAN_TYPE run completed',
    summary=run_data.get('summary', 'Run completed successfully'),
    status='completed',
    priority='low',
    auto_safe=True,
    action_required=False,
    source_file='$RUN_OUTPUT'
)
append_event(completed)
print(f'Processed {len(run_data.get(\"events\", []))} events from agent output')
" >> "$LOG_FILE" 2>&1
else
  # Agent failed or no structured output
  $PYTHON -c "
import sys; sys.path.insert(0, '$AGENTS_DIR')
from core.event_schema import create_event, append_event
evt = create_event(
    agent='$AGENT_NAME',
    run_id='$RUN_ID',
    event_type='agent_run_failed' if $EXIT_CODE != 0 else 'agent_run_completed',
    entity_type='other',
    entity_id='$RUN_ID',
    title='$AGENT_NAME $SCAN_TYPE run ' + ('failed' if $EXIT_CODE != 0 else 'completed (no structured output)'),
    summary='Exit code $EXIT_CODE. No structured output at $RUN_OUTPUT.',
    status='failed' if $EXIT_CODE != 0 else 'completed',
    priority='high' if $EXIT_CODE != 0 else 'low',
    auto_safe=True,
    action_required=$EXIT_CODE != 0
)
append_event(evt)
" >> "$LOG_FILE" 2>&1
fi

# ── Run rules engine + health check + dashboard rebuild ──────
echo "[$FINISH_TIMESTAMP] Running rules engine..." >> "$LOG_FILE"
$PYTHON "$SCRIPTS_DIR/run_rules_engine.py" >> "$LOG_FILE" 2>&1 || true

echo "[$FINISH_TIMESTAMP] Agent run complete: $AGENT_NAME ($SCAN_TYPE) run_id=$RUN_ID exit=$EXIT_CODE" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
