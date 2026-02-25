import { fetchWithAuth } from './googleAuth';

const BASE = 'https://www.googleapis.com/calendar/v3';

const CATEGORY_KEYWORDS = {
  health: ['doctor', 'dentist', 'physical', 'gyno', 'ob/gyn', 'dermatologist', 'eye', 'botox', 'medical', 'therapy', 'pharmacy'],
  travel: ['flight', 'hotel', 'airport', 'vacation', 'trip', 'travel'],
  finance: ['tax', 'insurance', 'mortgage', 'bank', 'financial', 'accountant', 'cpa'],
  home: ['hvac', 'plumber', 'electrician', 'pest', 'gutter', 'repair', 'maintenance', 'lawn'],
  business: ['etsy', 'shelzy', 'order', 'inventory', 'supplier', 'wholesale'],
  social: ['dinner', 'brunch', 'party', 'birthday', 'wedding', 'date night', 'happy hour'],
};

export function autoCategorize(eventTitle) {
  const lower = (eventTitle || '').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return 'personal';
}

export async function listCalendars() {
  const res = await fetchWithAuth(`${BASE}/users/me/calendarList`);
  const data = await res.json();
  return data.items || [];
}

export async function listEvents(calendarId = 'primary', timeMin, timeMax) {
  const params = new URLSearchParams({
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax || new Date(Date.now() + 30 * 86400000).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  });
  const res = await fetchWithAuth(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
  const data = await res.json();
  return (data.items || []).map((e) => ({
    id: e.id,
    title: e.summary || '(No title)',
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    location: e.location,
    description: e.description,
    recurring: !!e.recurringEventId,
    category: autoCategorize(e.summary),
    source: 'google',
    calendarId,
  }));
}

export async function createEvent(calendarId = 'primary', event) {
  const res = await fetchWithAuth(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: event.title,
      start: { dateTime: event.start, timeZone: 'America/New_York' },
      end: { dateTime: event.end, timeZone: 'America/New_York' },
      location: event.location,
      description: event.description,
    }),
  });
  return res.json();
}

export async function deleteEvent(calendarId = 'primary', eventId) {
  await fetchWithAuth(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, { method: 'DELETE' });
}

export function detectConflicts(events) {
  const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
  const conflicts = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (new Date(sorted[i].end) > new Date(sorted[i + 1].start)) {
      conflicts.push([sorted[i], sorted[i + 1]]);
    }
  }
  return conflicts;
}
