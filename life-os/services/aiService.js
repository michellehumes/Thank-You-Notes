/**
 * AI Service
 * Wraps the Anthropic SDK for Claude-powered features.
 * Requires ANTHROPIC_API_KEY in environment. If not set, functions return null
 * and callers fall back to their template-based defaults.
 */
const Anthropic = require('@anthropic-ai/sdk');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('ai');

let client = null;

function getClient() {
  if (client) return client;
  if (!process.env.ANTHROPIC_API_KEY) {
    log.warn('ANTHROPIC_API_KEY not set — AI features disabled');
    return null;
  }
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const BRIEF_SYSTEM_PROMPT = {
  type: 'text',
  text: `You are a direct, insightful personal assistant writing a daily executive brief.
Rules:
- Write exactly 3-4 sentences in second person (you/your)
- Lead with the most important thing happening today
- Connect dots across health, finance, and career when there's a meaningful pattern
- End with one specific action to take today
- Use the actual numbers from the data — don't paraphrase them away
- No bullet points, no headers, no padding`,
  cache_control: { type: 'ephemeral' },
};

/**
 * Generates an AI-written narrative for the daily executive brief.
 * Returns null if AI is unavailable; caller should fall back to template.
 *
 * @param {object} data - Structured brief data from generateBrief()
 * @returns {Promise<string|null>}
 */
async function generateBriefNarrative(data) {
  const c = getClient();
  if (!c) return null;

  const { score, sections, riskFlags, actionItems } = data;

  const userContent = `Generate my daily executive brief from this data:

Score: ${score.overall}/100 (${score.grade})
Financial: ${sections.finance.highlights.join(' | ')}
Career: ${sections.career.highlights.join(' | ')}
Health: ${sections.health.highlights.join(' | ')}
Messages: ${sections.messages.highlights.join(' | ')}
Risks: ${riskFlags.length > 0 ? riskFlags.map(r => `[${r.level}] ${r.text}`).join(', ') : 'None'}
Top actions: ${actionItems.slice(0, 3).map(a => a.text).join(' | ')}`;

  try {
    const response = await c.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 300,
      system: [BRIEF_SYSTEM_PROMPT],
      messages: [{ role: 'user', content: userContent }],
    });

    const text = response.content.find(b => b.type === 'text')?.text ?? null;
    log.info(`AI brief generated (${response.usage.output_tokens} tokens)`);
    return text;
  } catch (err) {
    log.error(`AI brief generation failed: ${err.message}`);
    return null;
  }
}

const ASK_SYSTEM_PROMPT = {
  type: 'text',
  text: `You are a direct, candid personal advisor with real-time access to the user's life data.
Rules:
- Answer in 2-4 sentences. Be specific — use the actual numbers from the context.
- If the question is vague, make your best inference and answer that.
- Connect dots across categories when relevant (e.g. low score could be finance AND health).
- Never say "based on the data provided" — just answer as if you know this person.
- No bullet points, no headers. Conversational but direct.`,
  cache_control: { type: 'ephemeral' },
};

/**
 * Answers a free-form question about the user's life data.
 * Returns null if AI is unavailable.
 *
 * @param {string} question - The user's question
 * @param {object} context - Snapshot of live data (score, finance, career, health, messages, brief)
 * @returns {Promise<string|null>}
 */
async function askQuestion(question, context) {
  const c = getClient();
  if (!c) return null;

  const { score, finance, career, health, messages, latestBrief } = context;

  const contextBlock = [
    `Today: ${new Date().toISOString().split('T')[0]}`,
    `Executive Score: ${score?.overall ?? 'N/A'}/100 (${score?.grade ?? '?'})`,
    score?.components ? `  - Financial: ${score.components.financial_stability?.score ?? 0}/30` : '',
    score?.components ? `  - Career: ${score.components.career_momentum?.score ?? 0}/25` : '',
    score?.components ? `  - Health: ${score.components.health_readiness?.score ?? 0}/15` : '',
    score?.components ? `  - Relationships: ${score.components.relationship_hygiene?.score ?? 0}/10` : '',
    '',
    finance ? `Finance: runway=${finance.runway_months}mo, burn=$${Math.round(finance.monthly_burn_avg ?? 0).toLocaleString()}/mo, liquid=$${Math.round(finance.liquid_assets ?? 0).toLocaleString()}` : 'Finance: unavailable',
    career ? `Career: ${career.total ?? 0} roles tracked, avg score=${Math.round(career.composite_stats?.avg ?? 0)}` : 'Career: unavailable',
    health ? `Health: ${health}` : 'Health: not configured',
    messages ? `Messages: ${messages}` : 'Messages: not configured',
    latestBrief ? `Last brief summary: ${latestBrief}` : '',
  ].filter(Boolean).join('\n');

  const userContent = `Context:\n${contextBlock}\n\nQuestion: ${question}`;

  try {
    const response = await c.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 250,
      system: [ASK_SYSTEM_PROMPT],
      messages: [{ role: 'user', content: userContent }],
    });

    const text = response.content.find(b => b.type === 'text')?.text ?? null;
    log.info(`AI answer generated (${response.usage.output_tokens} tokens)`);
    return text;
  } catch (err) {
    log.error(`AI ask failed: ${err.message}`);
    return null;
  }
}

module.exports = { generateBriefNarrative, askQuestion };
