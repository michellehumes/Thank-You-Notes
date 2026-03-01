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

// ── Data Fetching ───────────────────────────────────
async function fetchJson(url) {
  const res = await fetch(`${API}${url}`);
  return res.json();
}

function fmt(n) {
  if (n == null) return '—';
  return '$' + Math.round(n).toLocaleString();
}

// ── Banner ──────────────────────────────────────────
async function loadBanner() {
  try {
    const [score, runway] = await Promise.all([
      fetchJson('/api/score/current'),
      fetchJson('/api/finance/runway')
    ]);
    document.getElementById('exec-score').textContent = score.overall || '—';
    document.getElementById('runway-months').textContent = runway.runway_months ? `${runway.runway_months}mo` : '—';

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

    // Tier 1 count
    try {
      const pipeline = await fetchJson('/api/jobs?tier=1');
      document.getElementById('tier1-count').textContent = pipeline.length || 0;
    } catch { document.getElementById('tier1-count').textContent = '0'; }

    // Drift alerts
    const alertsEl = document.getElementById('drift-alerts');
    alertsEl.innerHTML = '';
    if (drift.flags && drift.flags.length > 0) {
      drift.flags.forEach(f => {
        const div = document.createElement('div');
        div.className = `alert-item ${f.severity}`;
        div.textContent = f.description;
        alertsEl.appendChild(div);
      });
    } else {
      alertsEl.innerHTML = '<div class="alert-item info">No drift alerts — finances stable</div>';
    }

    // Monthly flow table
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

  // Pagination
  const pagEl = document.getElementById('txn-pagination');
  pagEl.innerHTML = '';
  for (let i = 1; i <= (data.pages || 1); i++) {
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
  const data = await fetchJson('/api/finance/shared-expenses');
  const split = await fetchJson('/api/finance/split');

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

  const splitEl = document.getElementById('split-result');
  splitEl.innerHTML = `
    <div class="card-grid">
      <div class="card"><h3>Michelle's Share (${split.ratio?.michelle || 50}%)</h3><div class="card-value">${fmt(split.michelle_contribution)}</div><div class="card-sub">Remaining: ${fmt(split.michelle_remaining)}</div></div>
      <div class="card"><h3>Gray's Share (${split.ratio?.gray || 50}%)</h3><div class="card-value">${fmt(split.gray_contribution)}</div><div class="card-sub">Remaining: ${fmt(split.gray_remaining)}</div></div>
    </div>
  `;
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
    (pipeline || []).forEach(j => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${j.company || ''}</td><td>${j.title || ''}</td><td>${j.composite_score || ''}</td><td class="tier-${j.tier}">T${j.tier}</td><td>${j.resume_version || ''}</td><td>${j.status || ''}</td><td>${j.stage || ''}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error('Career load failed:', e); }
}

// ── Tab Router ──────────────────────────────────────
function loadTab(tab) {
  switch (tab) {
    case 'overview': loadOverview(); break;
    case 'transactions': loadTransactions(); break;
    case 'budget': loadBudget(); break;
    case 'career': loadCareer(); break;
  }
}

// ── Utility ─────────────────────────────────────────
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// ── Init ────────────────────────────────────────────
loadBanner();
loadOverview();
