const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
].join(' ');

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function getStoredTokens() {
  const raw = localStorage.getItem('plh_google_tokens');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function storeTokens(tokens) {
  localStorage.setItem('plh_google_tokens', JSON.stringify({ ...tokens, storedAt: Date.now() }));
}

export function clearTokens() {
  localStorage.removeItem('plh_google_tokens');
}

export function isTokenExpired(tokens) {
  if (!tokens?.storedAt || !tokens?.expires_in) return true;
  return Date.now() > tokens.storedAt + tokens.expires_in * 1000 - 60000;
}

export async function fetchWithAuth(url, options = {}) {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not authenticated');
  return fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${tokens.access_token}` },
  });
}
