const ETSY_API_KEY = import.meta.env.VITE_ETSY_API_KEY;
const BASE = 'https://api.etsy.com/v3/application';

async function etsyFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-api-key': ETSY_API_KEY },
  });
  if (!res.ok) throw new Error(`Etsy API error: ${res.status}`);
  return res.json();
}

export async function getShopReceipts(shopId, limit = 25) {
  const data = await etsyFetch(`/shops/${shopId}/receipts?limit=${limit}&sort_on=created&sort_order=desc`);
  return (data.results || []).map((r) => ({
    id: r.receipt_id,
    orderId: r.receipt_id,
    buyer: r.buyer_user_id,
    total: r.grandtotal?.amount / r.grandtotal?.divisor || 0,
    currency: r.grandtotal?.currency_code || 'USD',
    status: r.status,
    createdAt: new Date(r.create_timestamp * 1000).toISOString(),
    shippedAt: r.shipped_timestamp ? new Date(r.shipped_timestamp * 1000).toISOString() : null,
    items: r.transactions?.length || 0,
  }));
}

export async function getShopListings(shopId, state = 'active') {
  const data = await etsyFetch(`/shops/${shopId}/listings?state=${state}&limit=100`);
  return (data.results || []).map((l) => ({
    id: l.listing_id,
    title: l.title,
    price: l.price?.amount / l.price?.divisor || 0,
    quantity: l.quantity,
    views: l.views,
    favorites: l.num_favorers,
    state: l.state,
    lowStock: l.quantity < 5,
  }));
}

export function computeMetrics(receipts, listings) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 86400000);
  const recentOrders = receipts.filter((r) => new Date(r.createdAt) >= thirtyDaysAgo);
  const revenue = recentOrders.reduce((sum, r) => sum + r.total, 0);
  const refunds = recentOrders.filter((r) => r.status === 'refunded');
  const shipped = recentOrders.filter((r) => r.shippedAt);
  const avgFulfill = shipped.length > 0
    ? shipped.reduce((sum, r) => sum + (new Date(r.shippedAt) - new Date(r.createdAt)) / 86400000, 0) / shipped.length
    : 0;
  const lowStockItems = listings.filter((l) => l.lowStock);
  return {
    monthlyRevenue: revenue,
    monthlyOrders: recentOrders.length,
    averageOrderValue: recentOrders.length > 0 ? revenue / recentOrders.length : 0,
    refundRate: recentOrders.length > 0 ? (refunds.length / recentOrders.length) * 100 : 0,
    fulfillmentAvgDays: Math.round(avgFulfill * 10) / 10,
    inventoryItems: listings.length,
    lowStockItems: lowStockItems.length,
    lowStockDetails: lowStockItems,
  };
}

// CSV fallback ingestion
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
  });
}
