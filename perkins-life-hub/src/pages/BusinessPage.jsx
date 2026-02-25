import Card from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BusinessPage({ data }) {
  const biz = data.businessData || {};
  const mockMonthly = [
    { month: 'Sep', revenue: 2100, orders: 48 },
    { month: 'Oct', revenue: 2450, orders: 55 },
    { month: 'Nov', revenue: 3200, orders: 78 },
    { month: 'Dec', revenue: 4100, orders: 95 },
    { month: 'Jan', revenue: 2650, orders: 61 },
    { month: 'Feb', revenue: biz.monthlyRevenue || 2840, orders: biz.monthlyOrders || 67 },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">Shelzy's Designs</h2>
      <p className="text-[12px] text-neutral-500 mb-4">Etsy business metrics — connect Etsy API in Settings for live data</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Revenue (30d)</p><p className="text-2xl font-bold">${(biz.monthlyRevenue || 0).toLocaleString()}</p></div></Card>
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Orders</p><p className="text-2xl font-bold">{biz.monthlyOrders || 0}</p></div></Card>
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Avg Order</p><p className="text-2xl font-bold">${(biz.averageOrderValue || 0).toFixed(2)}</p></div></Card>
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Refund Rate</p><p className="text-2xl font-bold">{biz.refundRate || 0}%</p></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Bar dataKey="revenue" fill="#4c6ef5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Performance Metrics">
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between py-2 border-b border-neutral-100"><span className="text-neutral-600">Fulfillment Speed</span><span className="font-medium">{biz.fulfillmentAvgDays || 0} days avg</span></div>
            <div className="flex justify-between py-2 border-b border-neutral-100"><span className="text-neutral-600">Active Listings</span><span className="font-medium">{biz.inventoryItems || 0}</span></div>
            <div className="flex justify-between py-2 border-b border-neutral-100"><span className="text-neutral-600">Low Stock Items</span><span className={`font-medium ${(biz.lowStockItems || 0) > 0 ? 'text-warning' : 'text-success'}`}>{biz.lowStockItems || 0}</span></div>
            <div className="flex justify-between py-2"><span className="text-neutral-600">Platform</span><span className="font-medium">{biz.platform || 'Etsy'}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
