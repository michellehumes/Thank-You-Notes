const PLAID_ENV = import.meta.env.VITE_PLAID_ENV || 'sandbox';
const BASE_URLS = {
  sandbox: 'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production: 'https://production.plaid.com',
};

function getBaseUrl() { return BASE_URLS[PLAID_ENV] || BASE_URLS.sandbox; }

// NOTE: In production, Plaid calls must go through YOUR backend server.
// These functions represent the client-side interface to your backend API.

export async function createLinkToken() {
  const res = await fetch('/api/plaid/link-token', { method: 'POST' });
  return res.json();
}

export async function exchangePublicToken(publicToken) {
  const res = await fetch('/api/plaid/exchange-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_token: publicToken }),
  });
  return res.json();
}

export async function getAccounts() {
  const res = await fetch('/api/plaid/accounts');
  return res.json();
}

export async function getTransactions(startDate, endDate) {
  const res = await fetch('/api/plaid/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_date: startDate, end_date: endDate }),
  });
  return res.json();
}

export async function getBalances() {
  const res = await fetch('/api/plaid/balances');
  return res.json();
}

export function categorizeTransaction(tx) {
  const cat = (tx.category || [])[0]?.toLowerCase() || '';
  const name = (tx.name || '').toLowerCase();
  if (/mortgage|rent/i.test(name)) return { category: 'housing', payer: 'household' };
  if (/electric|gas|water|internet|phone|verizon|at&t|comcast/i.test(name)) return { category: 'utilities', payer: 'household' };
  if (/insurance/i.test(name)) return { category: 'insurance', payer: 'household' };
  if (/grocery|kroger|publix|whole foods|trader joe/i.test(name)) return { category: 'food', payer: 'household' };
  if (/restaurant|doordash|ubereats|grubhub/i.test(name)) return { category: 'food', payer: null };
  if (/gas station|shell|bp|exxon|chevron/i.test(name)) return { category: 'transportation', payer: null };
  if (/doctor|dentist|pharmacy|cvs|walgreens/i.test(name)) return { category: 'health', payer: null };
  if (/netflix|spotify|hulu|disney|amazon prime/i.test(name)) return { category: 'entertainment', payer: 'household' };
  if (/etsy|shipping|usps|ups|fedex/i.test(name)) return { category: 'business', payer: 'michelle' };
  return { category: 'personal', payer: null };
}
