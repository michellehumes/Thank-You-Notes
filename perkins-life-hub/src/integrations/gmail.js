import { fetchWithAuth } from './googleAuth';

const BASE = 'https://www.googleapis.com/gmail/v1/users/me';

export async function searchMessages(query, maxResults = 20) {
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
  const res = await fetchWithAuth(`${BASE}/messages?${params}`);
  const data = await res.json();
  return data.messages || [];
}

export async function getMessage(messageId) {
  const res = await fetchWithAuth(`${BASE}/messages/${messageId}?format=full`);
  return res.json();
}

export async function scanForAutoDetection() {
  const detections = [];
  const queries = [
    { q: 'subject:(confirmation OR booking OR itinerary) newer_than:7d', type: 'travel' },
    { q: 'subject:(appointment OR scheduled OR reminder) newer_than:7d', type: 'health' },
    { q: 'subject:(renewal OR subscription OR billing) newer_than:30d', type: 'subscription' },
    { q: 'subject:(payment OR charge OR transaction) larger:1 newer_than:7d', type: 'financial' },
  ];
  for (const { q, type } of queries) {
    try {
      const messages = await searchMessages(q, 5);
      for (const msg of messages) {
        const full = await getMessage(msg.id);
        const subject = full.payload?.headers?.find((h) => h.name === 'Subject')?.value || '';
        const from = full.payload?.headers?.find((h) => h.name === 'From')?.value || '';
        const date = full.payload?.headers?.find((h) => h.name === 'Date')?.value || '';
        detections.push({ id: msg.id, type, subject, from, date, approved: false });
      }
    } catch { /* skip on error */ }
  }
  return detections;
}
