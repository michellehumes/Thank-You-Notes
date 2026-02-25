import { fetchWithAuth } from './googleAuth';

const BASE = 'https://www.googleapis.com/drive/v3';

export async function listFiles(folderId, query = '') {
  const q = folderId
    ? `'${folderId}' in parents and trashed = false`
    : `trashed = false${query ? ` and fullText contains '${query}'` : ''}`;
  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink,parents)',
    orderBy: 'modifiedTime desc',
    pageSize: '100',
  });
  const res = await fetchWithAuth(`${BASE}/files?${params}`);
  const data = await res.json();
  return (data.files || []).map((f) => ({
    id: f.id,
    name: f.name,
    type: f.mimeType,
    modified: f.modifiedTime,
    size: f.size,
    link: f.webViewLink,
    category: categorizeDocument(f.name),
  }));
}

export async function getFolders() {
  const params = new URLSearchParams({
    q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id,name)',
    orderBy: 'name',
  });
  const res = await fetchWithAuth(`${BASE}/files?${params}`);
  const data = await res.json();
  return data.files || [];
}

function categorizeDocument(filename) {
  const lower = (filename || '').toLowerCase();
  if (/insurance|policy|coverage/i.test(lower)) return 'insurance';
  if (/tax|w-?2|1099|return/i.test(lower)) return 'tax';
  if (/will|trust|estate|power.of.attorney/i.test(lower)) return 'legal';
  if (/medical|health|lab|rx|prescription/i.test(lower)) return 'medical';
  if (/warranty|receipt/i.test(lower)) return 'warranty';
  if (/statement|account|balance/i.test(lower)) return 'financial';
  if (/deed|title|mortgage|lease/i.test(lower)) return 'property';
  return 'other';
}

export function detectExpiration(filename) {
  const match = filename.match(/exp(?:ires?)?[\s_-]*(\d{1,2})[\/\-_](\d{2,4})/i);
  if (!match) return null;
  const month = parseInt(match[1]);
  const year = match[2].length === 2 ? 2000 + parseInt(match[2]) : parseInt(match[2]);
  return new Date(year, month - 1, 28);
}
