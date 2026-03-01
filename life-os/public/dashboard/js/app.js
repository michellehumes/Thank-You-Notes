const API = '';

// ── Tab Navigation ──────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    loadTab(btn.dataset.tab);
  });
});

// ── Helpers ─────────────────────────────────────────
async function fetchJson(url) {
  const res = await fetch(`${API}${url}`);
  return res.json();
}

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return '$' + Math.abs(Math.round(n)).toLocaleString();
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function relTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffH = Math.round((now - d) / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.round(diffH / 24)}d ago`;
}

// ── Banner ──────────────────────────────────────────
async function loadBanner() {
  try {
    const [score, runway] = await Promise.all([
      fetchJson('/api/score/current'),
      fetchJson('/api/finance/runway')
    ]);

    const scoreEl = document.getElementById('exec-score');
    scoreEl.textContent = score.overall ?? '—';
    scoreEl.style.color = score.overall >= 70 ? 'var(--accent-green)' : score.overall >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)';

    const runwayEl = document.getElementById('runway-months');
    runwayEl.textContent = runway.runway_months ? `${runway.runway_months}mo` : '—';
    runwayEl.style.color = runway.runway_months >= 9 ? 'var(--accent-green)' : runway.runway_months >= 6 ? 'var(--accent-yellow)' : 'var(--accent-red)';

    const drift = await fetchJson('/api/finance/drift');
    const flagsEl = document.getElementById('risk-flags');
    flagsEl.innerHTML = '';
    (drift.flags || []).slice(0, 3).forEach(f => {
      const span = document.createElement('span');
      span.className = `risk-flag ${f.severity}`;
      span.textContent = f.type.replace(/_/g, ' ');
      flagsEl.appendChild(span);
    });
  } catch (e) { console.error('Banner load failed:', e); }
}

// ── Overview Tab ────────────────────────────────────
async function loadOverview() {
  try {
    const [burn, runway, anomalies, flow, drift] = await Promise.all([
      fetchJson('/api/finance/burn-rate?days=30'),
      fetchJson('/api/finance/runway'),
      fetchJson('/api/finance/anomalies'),
      fetchJson('/api/finance/monthly-flow'),
      fetchJson('/api/finance/drift')
    ]);

    document.getElementById('burn-rate').textContent = fmt(burn.monthly_burn);
    document.getElementById('burn-trend').textContent = `${fmt(burn.daily_burn)}/day`;
    document.getElementById('runway-card').textContent = runway.runway_months ? `${runway.runway_months} months` : '—';
    document.getElementById('runway-sub').textContent = `at ${fmt(runway.monthly_burn_avg)}/mo burn`;
    document.getElementById('anomaly-count').textContent = anomalies.length || 0;

    const critical = anomalies.filter(a => a.severity === 'critical').length;
    document.getElementById('anomaly-severity').textContent = critical > 0 ? `${critical} critical` : 'None critical';

    try {
      const pipeline = await fetchJson('/api/jobs?tier=1');
      document.getElementById('tier1-count').textContent = Array.isArray(pipeline) ? pipeline.length : 0;
    } catch { document.getElementById('tier1-count').textContent = '0'; }

    const alertsEl = document.getElementById('drift-alerts');
    alertsEl.innerHTML = '';
    if (drift.flags?.length > 0) {
      drift.flags.forEach(f => {
        const div = document.createElement('div');
        div.className = `alert-item ${f.severity}`;
        div.textContent = f.description;
        alertsEl.appendChild(div);
      });
    } else {
      alertsEl.innerHTML = '<div class="alert-item info">No drift alerts — finances stable</div>';
    }

    const tbody = document.querySelector('#flow-table tbody');
    tbody.innerHTML = '';
    (flow || []).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.month}</td><td class="amount-positive">${fmt(r.income)}</td><td class="amount-negative">${fmt(r.expenses)}</td><td class="${r.net >= 0 ? 'amount-positive' : 'amount-negative'}">${fmt(r.net)}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error('Overview load failed:', e); }
}

// ── Transactions Tab ────────────────────────────────
let txnPage = 1;

async function loadTransactions() {
  const owner = document.getElementById('owner-filter').value;
  const classification = document.getElementById('class-filter').value;
  const search = document.getElementById('search-filter').value;

  const params = new URLSearchParams({ page: txnPage, limit: 50 });
  if (owner) params.set('owner', owner);
  if (classification) params.set('classification', classification);
  if (search) params.set('search', search);

  const data = await fetchJson(`/api/finance/transactions?${params}`);
  const tbody = document.querySelector('#txn-table tbody');
  tbody.innerHTML = '';

  (data.transactions || []).forEach(t => {
    const tr = document.createElement('tr');
    const amtClass = t.amount >= 0 ? 'amount-positive' : 'amount-negative';
    tr.innerHTML = `<td>${t.date}</td><td>${t.merchant || ''}</td><td class="${amtClass}">${fmt(Math.abs(t.amount))}</td><td>${t.category || ''}</td><td>${t.account || ''}</td><td>${t.owner || ''}</td><td>${t.classification || ''}</td>`;
    tbody.appendChild(tr);
  });

  const pagEl = document.getElementById('txn-pagination');
  pagEl.innerHTML = '';
  const totalPages = data.pages || 1;
  for (let i = 1; i <= Math.min(totalPages, 10); i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === txnPage) btn.classList.add('active');
    btn.addEventListener('click', () => { txnPage = i; loadTransactions(); });
    pagEl.appendChild(btn);
  }
}

document.getElementById('owner-filter').addEventListener('change', () => { txnPage = 1; loadTransactions(); });
document.getElementById('class-filter').addEventListener('change', () => { txnPage = 1; loadTransactions(); });
document.getElementById('search-filter').addEventListener('input', debounce(() => { txnPage = 1; loadTransactions(); }, 300));

// ── Budget Tab ──────────────────────────────────────
async function loadBudget() {
  try {
    const [data, split] = await Promise.all([
      fetchJson('/api/finance/shared-expenses'),
      fetchJson('/api/finance/split')
    ]);

    document.getElementById('budget-fixed').textContent = fmt(data.budget_fixed);
    document.getElementById('budget-variable').textContent = fmt(data.budget_variable);
    document.getElementById('budget-total').textContent = fmt(data.budget_total);
    document.getElementById('budget-actual').textContent = fmt(data.actual_spend);

    const tbody = document.querySelector('#budget-table tbody');
    tbody.innerHTML = '';
    (data.budget_items || []).forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${b.name}</td><td>${fmt(b.amount)}</td><td>${b.category}</td><td>${b.card_account || ''}</td><td>${b.who_pays || ''}</td>`;
      tbody.appendChild(tr);
    });

    document.getElementById('split-result').innerHTML = `
      <div class="card-grid">
        <div class="card"><h3>Michelle's Share (${split.ratio?.michelle || 50}%)</h3><div class="card-value">${fmt(split.michelle_contribution)}</div><div class="card-sub">Remaining: ${fmt(split.michelle_remaining)}</div></div>
        <div class="card"><h3>Gray's Share (${split.ratio?.gray || 50}%)</h3><div class="card-value">${fmt(split.gray_contribution)}</div><div class="card-sub">Remaining: ${fmt(split.gray_remaining)}</div></div>
      </div>
    `;
  } catch (e) { console.error('Budget load failed:', e); }
}

// ── Career Tab ──────────────────────────────────────
async function loadCareer() {
  try {
    const [analytics, pipeline] = await Promise.all([
      fetchJson('/api/jobs/analytics'),
      fetchJson('/api/jobs')
    ]);

    document.getElementById('career-total').textContent = analytics.total || 0;
    const t1 = (analytics.by_tier || []).find(t => t.tier === 1);
    const t2 = (analytics.by_tier || []).find(t => t.tier === 2);
    document.getElementById('career-t1').textContent = t1?.count || 0;
    document.getElementById('career-t2').textContent = t2?.count || 0;
    document.getElementById('career-avg').textContent = analytics.composite_stats?.avg ? Math.round(analytics.composite_stats.avg) : '—';

    const tbody = document.querySelector('#pipeline-table tbody');
    tbody.innerHTML = '';
    (Array.isArray(pipeline) ? pipeline : []).forEach(j => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${j.company || ''}</td><td>${j.title || ''}</td><td>${j.composite_score || ''}</td><td class="tier-${j.tier}">T${j.tier}</td><td>${j.resume_version || ''}</td><td>${j.status || ''}</td><td>${j.stage || ''}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error('Career load failed:', e); }
}

// ── Health Tab ──────────────────────────────────────
async function loadHealth() {
  try {
    const trend = await fetchJson('/api/health/trend?days=14');
    if (trend.status === 'not_configured' || !trend.data?.length) {
      document.getElementById('health-configured').style.display = 'none';
      document.getElementById('health-unconfigured').style.display = 'block';
      return;
    }
    document.getElementById('health-configured').style.display = 'block';
    document.getElementById('health-unconfigured').style.display = 'none';
    document.getElementById('health-sleep').textContent = trend.averages?.sleep_score ?? '—';
    document.getElementById('health-readiness').textContent = trend.averages?.readiness_score ?? '—';
    document.getElementById('health-activity').textContent = trend.averages?.activity_score ?? '—';
    document.getElementById('health-steps').textContent = trend.averages?.steps ? trend.averages.steps.toLocaleString() : '—';

    const tbody = document.querySelector('#health-trend-table tbody');
    tbody.innerHTML = '';
    (trend.data || []).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.date}</td><td>${r.sleep_score||'—'}</td><td>${r.readiness_score||'—'}</td><td>${r.activity_score||'—'}</td><td>${r.sleep_hours||'—'}</td><td>${r.hrv_avg||'—'}</td><td>${r.resting_hr||'—'}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error('Health load failed:', e); }
}

async function syncHealth() {
  try { await fetch('/api/health/sync', { method: 'POST' }); loadHealth(); } catch {}
}

// ── Messages Tab ────────────────────────────────────
async function loadMessages() {
  try {
    const [pending, stats] = await Promise.all([
      fetchJson('/api/messages/pending'),
      fetchJson('/api/messages/stats')
    ]);
    if (pending.status === 'not_configured') {
      document.getElementById('msg-configured').style.display = 'none';
      document.getElementById('msg-unconfigured').style.display = 'block';
      return;
    }
    document.getElementById('msg-configured').style.display = 'block';
    document.getElementById('msg-unconfigured').style.display = 'none';
    document.getElementById('msg-pending').textContent = pending.count || 0;
    document.getElementById('msg-overdue').textContent = stats.overdue_24h ?? 0;
    document.getElementById('msg-score').textContent = stats.score ?? '—';

    const tbody = document.querySelector('#msg-table tbody');
    tbody.innerHTML = '';
    (pending.pending || []).forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${m.contact_name || m.contact_identifier}</td><td>${(m.last_message||'').substring(0, 80)}</td><td>${relTime(m.received_at)}</td><td>${m.waiting_hours}h</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error('Messages load failed:', e); }
}

async function syncMessages() {
  try { await fetch('/api/messages/sync', { method: 'POST' }); loadMessages(); } catch {}
}

// ── Todos Tab ───────────────────────────────────────
async function loadTodos() {
  try {
    const todos = await fetchJson('/api/todos');
    const tbody = document.querySelector('#todo-table tbody');
    tbody.innerHTML = '';
    (todos || []).forEach(t => {
      const tr = document.createElement('tr');
      const icon = t.completed ? '✅' : t.dismissed ? '🚫' : '⬜';
      const prioClass = t.priority === 1 ? 'amount-negative' : '';
      const isDone = t.completed || t.dismissed;
      tr.innerHTML = `
        <td>${icon}</td>
        <td class="${prioClass}">P${t.priority}</td>
        <td style="${isDone?'text-decoration:line-through;opacity:0.5':''}">${t.title}</td>
        <td>${t.category||''}</td>
        <td style="font-size:11px;color:var(--text-muted)">${t.source||'manual'}</td>
        <td>${!isDone?`<button class="small-btn" onclick="completeTodo(${t.id})">Done</button>`:''}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error('Todos load failed:', e); }
}

function showAddTodo() {
  const f = document.getElementById('add-todo-form');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

async function addTodo() {
  const title = document.getElementById('todo-title').value.trim();
  if (!title) return;
  await fetch('/api/todos', { method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ title, category: document.getElementById('todo-category').value, priority: parseInt(document.getElementById('todo-priority').value) }) });
  document.getElementById('todo-title').value = '';
  document.getElementById('add-todo-form').style.display = 'none';
  loadTodos();
}

async function completeTodo(id) {
  await fetch(`/api/todos/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({completed:true}) });
  loadTodos();
}

async function generateAutoTodos() {
  await fetch('/api/sync/run-all', { method: 'POST' });
  loadTodos();
}

// ── Brief Tab ───────────────────────────────────────
async function loadBrief() {
  try {
    const brief = await fetchJson('/api/briefs/today');
    const el = document.getElementById('brief-content');
    if (brief.status === 'no_brief') { el.innerHTML = `<div class="placeholder">${brief.message}</div>`; return; }

    const risks = (typeof brief.risk_flags === 'string' ? JSON.parse(brief.risk_flags || '[]') : brief.risk_flags) || [];
    const actions = (typeof brief.top_3_actions === 'string' ? JSON.parse(brief.top_3_actions || '[]') : brief.top_3_actions) || [];

    el.innerHTML = `
      <div class="card-grid">
        <div class="card"><h3>Executive Score</h3><div class="card-value" style="color:${brief.executive_score>=70?'var(--accent-green)':brief.executive_score>=40?'var(--accent-yellow)':'var(--accent-red)'}">${brief.executive_score}</div><div class="card-sub">${brief.status_label||''}</div></div>
      </div>
      ${risks.length?`<div class="section"><h2>Risk Flags</h2><div class="alert-list">${risks.map(r=>`<div class="alert-item ${r.level}">${r.text}</div>`).join('')}</div></div>`:''}
      <div class="section"><h2>Financial</h2><p style="color:var(--text-secondary)">${brief.financial_summary||'No data'}</p></div>
      <div class="section"><h2>Career</h2><p style="color:var(--text-secondary)">${brief.career_summary||'No data'}</p></div>
      <div class="section"><h2>Health</h2><p style="color:var(--text-secondary)">${brief.health_summary||'No data'}</p></div>
      <div class="section"><h2>Messages</h2><p style="color:var(--text-secondary)">${brief.messages_to_reply||'No data'}</p></div>
      ${actions.length?`<div class="section"><h2>Top Actions</h2><div class="alert-list">${actions.map(a=>`<div class="alert-item ${a.priority===1?'critical':'warning'}"><strong>[P${a.priority}]</strong> ${a.text} <span style="color:var(--text-muted)">(${a.category})</span></div>`).join('')}</div></div>`:''}
      <div class="section"><h2>Summary</h2><p style="color:var(--text-secondary)">${brief.natural_language||''}</p></div>
      <p style="text-align:right;font-size:11px;color:var(--text-muted);margin-top:12px">Generated: ${brief.generated_at||'—'}</p>`;
  } catch (e) { console.error('Brief load failed:', e); }
}

async function generateBrief() {
  document.getElementById('brief-content').innerHTML = '<div class="placeholder">Generating brief...</div>';
  try { await fetch('/api/briefs/generate', { method: 'POST' }); loadBrief(); } catch (e) { console.error(e); }
}

// ── Sync Tab ────────────────────────────────────────
async function loadSync() {
  try {
    const data = await fetchJson('/api/sync/status');
    const el = document.getElementById('sync-status');
    el.innerHTML = '';
    Object.entries(data.services||{}).forEach(([name, svc]) => {
      const color = svc.status==='success'?'var(--accent-green)':svc.status==='never_run'?'var(--text-muted)':'var(--accent-red)';
      const badge = svc.configured?'<span style="color:var(--accent-green);font-size:11px">✓ configured</span>':'<span style="color:var(--accent-yellow);font-size:11px">⚠ not configured</span>';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<h3>${name.replace(/_/g,' ')}</h3><div class="card-value" style="font-size:16px;color:${color}">${svc.status||'unknown'}</div><div class="card-sub">${badge}</div><div class="card-sub">${svc.completed_at?`Last: ${relTime(svc.completed_at)}`:'Never synced'}</div>`;
      el.appendChild(card);
    });
  } catch (e) { console.error('Sync load failed:', e); }
}

async function runFullSync() {
  document.getElementById('sync-status').innerHTML = '<div class="placeholder">Running sync...</div>';
  try { await fetch('/api/sync/run-all', { method: 'POST' }); loadSync(); loadBanner(); } catch (e) { console.error(e); }
}

// ── Tab Router ──────────────────────────────────────
function loadTab(tab) {
  switch (tab) {
    case 'overview': loadOverview(); break;
    case 'transactions': loadTransactions(); break;
    case 'budget': loadBudget(); break;
    case 'career': loadCareer(); break;
    case 'health': loadHealth(); break;
    case 'messages': loadMessages(); break;
    case 'todos': loadTodos(); break;
    case 'brief': loadBrief(); break;
    case 'sync': loadSync(); break;
  }
}

// ── Init ────────────────────────────────────────────
loadBanner();
loadOverview();
