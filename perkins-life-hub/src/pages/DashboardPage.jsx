import { format } from 'date-fns';
import KpiStrip from '../components/KpiStrip';
import AlertBanner from '../components/AlertBanner';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage({ data }) {
  const { events, alerts, healthCompliance, maintenance, financialData, businessData } = data;
  const now = new Date();
  const upcoming = (events || [])
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  const overdueHealth = Object.entries(healthCompliance || {}).flatMap(([person, items]) =>
    items.filter((i) => i.status === 'overdue' || i.status === 'due-soon')
  );

  const overdueMaint = (maintenance || []).filter((m) => m.status === 'overdue' || m.status === 'due-soon');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Dashboard</h2>
          <p className="text-[12px] text-neutral-500">{format(now, 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      <KpiStrip data={data} />
      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Upcoming Events" subtitle="Next 7 days" className="lg:col-span-2">
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-neutral-500">No upcoming events</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                  <div>
                    <span className="text-[13px] text-neutral-800">{e.title}</span>
                    <span className="text-[11px] text-neutral-500 ml-2">{format(new Date(e.date), 'MMM d, h:mm a')}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">{e.category}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Health Compliance" subtitle={`${overdueHealth.length} items need attention`}>
            {overdueHealth.length === 0 ? (
              <p className="text-[13px] text-success">All appointments on track</p>
            ) : (
              <div className="space-y-2">
                {overdueHealth.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[13px]">
                    <span className="text-neutral-700">{item.label}</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Maintenance" subtitle={`${overdueMaint.length} items due`}>
            {overdueMaint.length === 0 ? (
              <p className="text-[13px] text-success">All maintenance up to date</p>
            ) : (
              <div className="space-y-2">
                {overdueMaint.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[13px]">
                    <span className="text-neutral-700">{item.label}</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card title="Financial Snapshot">
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <p className="text-neutral-500">Monthly Income</p>
              <p className="text-lg font-bold text-neutral-900">${(financialData?.monthlyIncome || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-neutral-500">Monthly Expenses</p>
              <p className="text-lg font-bold text-neutral-900">${(financialData?.monthlyExpenses || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-neutral-500">Net Cash Flow</p>
              <p className="text-lg font-bold text-success">${((financialData?.monthlyIncome || 0) - (financialData?.monthlyExpenses || 0)).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-neutral-500">Accounts</p>
              <p className="text-lg font-bold text-neutral-900">{financialData?.accounts?.length || 0}</p>
            </div>
          </div>
        </Card>

        {businessData && (
          <Card title="Shelzy's Designs" subtitle="30-day metrics">
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="text-neutral-500">Revenue</p>
                <p className="text-lg font-bold text-neutral-900">${(businessData.monthlyRevenue || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-neutral-500">Orders</p>
                <p className="text-lg font-bold text-neutral-900">{businessData.monthlyOrders || 0}</p>
              </div>
              <div>
                <p className="text-neutral-500">Avg Order</p>
                <p className="text-lg font-bold text-neutral-900">${(businessData.averageOrderValue || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-neutral-500">Low Stock</p>
                <p className={`text-lg font-bold ${businessData.lowStockItems > 0 ? 'text-warning' : 'text-success'}`}>{businessData.lowStockItems || 0}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
