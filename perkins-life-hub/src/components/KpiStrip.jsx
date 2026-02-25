import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function KpiCard({ label, value, sublabel, trend, icon: Icon }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3 min-w-[160px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-neutral-500 uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={14} className="text-neutral-400" />}
      </div>
      <div className="text-lg font-bold text-neutral-900">{value}</div>
      {sublabel && (
        <div className="flex items-center gap-1 mt-0.5">
          {trend === 'up' && <TrendingUp size={11} className="text-success" />}
          {trend === 'down' && <TrendingDown size={11} className="text-danger" />}
          {trend === 'flat' && <Minus size={11} className="text-neutral-400" />}
          <span className={`text-[11px] ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-neutral-500'}`}>{sublabel}</span>
        </div>
      )}
    </div>
  );
}

export default function KpiStrip({ data }) {
  const { netWorth, savingsRate, emergencyMonths, financialData, alerts, events, maintenance, businessData } = data;
  const now = new Date();
  const next7 = events?.filter((e) => { const d = new Date(e.date); return d >= now && d <= new Date(now.getTime() + 7 * 86400000); }).length || 0;
  const next30 = events?.filter((e) => { const d = new Date(e.date); return d >= now && d <= new Date(now.getTime() + 30 * 86400000); }).length || 0;
  const overdueAlerts = alerts?.filter((a) => a.severity === 'critical').length || 0;
  const maintenanceDue = maintenance?.filter((m) => m.status === 'overdue' || m.status === 'due-soon').length || 0;
  const cashFlow = (financialData?.monthlyIncome || 0) - (financialData?.monthlyExpenses || 0);

  const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
      <KpiCard label="Next 7 Days" value={next7} sublabel={`${next30} in 30 days`} />
      <KpiCard label="Alerts" value={overdueAlerts} sublabel={overdueAlerts > 0 ? 'Needs attention' : 'All clear'} trend={overdueAlerts > 0 ? 'down' : 'up'} />
      <KpiCard label="Maintenance" value={maintenanceDue} sublabel={maintenanceDue > 0 ? 'Items due' : 'Up to date'} trend={maintenanceDue > 0 ? 'down' : 'up'} />
      <KpiCard label="Cash Flow" value={fmt(cashFlow)} sublabel={`${fmt(financialData?.monthlyIncome || 0)} income`} trend={cashFlow > 0 ? 'up' : 'down'} />
      <KpiCard label="Net Worth" value={fmt(netWorth || 0)} trend="up" />
      <KpiCard label="Savings Rate" value={`${savingsRate || 0}%`} trend={savingsRate > 20 ? 'up' : 'down'} />
      <KpiCard label="Emergency Fund" value={`${emergencyMonths || 0} mo`} sublabel={emergencyMonths >= 3 ? 'On track' : 'Below target'} trend={emergencyMonths >= 3 ? 'up' : 'down'} />
      {businessData && <KpiCard label="Shelzy's Revenue" value={fmt(businessData.monthlyRevenue || 0)} sublabel={`${businessData.monthlyOrders || 0} orders`} trend="up" />}
    </div>
  );
}
