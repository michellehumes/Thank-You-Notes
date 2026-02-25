import Card from '../components/Card';
import DataTable from '../components/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4c6ef5', '#748ffc', '#91a7ff', '#bac8ff', '#dbe4ff', '#059669', '#d97706', '#dc2626'];

export default function FinancePage({ data }) {
  const { financialData, netWorth, savingsRate, emergencyMonths, bills } = data;
  const accounts = financialData?.accounts || [];

  const accountsByType = accounts.reduce((acc, a) => {
    const type = a.type || 'other';
    if (!acc[type]) acc[type] = 0;
    acc[type] += a.balance;
    return acc;
  }, {});

  const pieData = Object.entries(accountsByType)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round(value) }));

  const barData = [
    { name: 'Income', amount: financialData?.monthlyIncome || 0 },
    { name: 'Expenses', amount: financialData?.monthlyExpenses || 0 },
    { name: 'Net', amount: (financialData?.monthlyIncome || 0) - (financialData?.monthlyExpenses || 0) },
  ];

  const accountColumns = [
    { key: 'name', label: 'Account' },
    { key: 'institution', label: 'Institution' },
    { key: 'type', label: 'Type', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'balance', label: 'Balance', align: 'right', render: (v) => <span className={v < 0 ? 'text-danger' : 'text-neutral-900'}>${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> },
  ];

  const billColumns = [
    { key: 'name', label: 'Bill' },
    { key: 'amount', label: 'Amount', align: 'right', render: (v) => `$${v.toLocaleString()}` },
    { key: 'dueDate', label: 'Due Day', render: (v) => `${v}${['st', 'nd', 'rd'][v - 1] || 'th'}` },
    { key: 'autopay', label: 'Autopay', render: (v) => v ? <span className="text-success text-[11px]">Active</span> : <span className="text-warning text-[11px]">Manual</span> },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-4">Finance</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Net Worth</p><p className="text-2xl font-bold text-neutral-900">${netWorth?.toLocaleString()}</p></div></Card>
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Savings Rate</p><p className="text-2xl font-bold text-primary-700">{savingsRate}%</p></div></Card>
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Emergency Fund</p><p className="text-2xl font-bold">{emergencyMonths} months</p></div></Card>
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Monthly Net</p><p className="text-2xl font-bold text-success">${((financialData?.monthlyIncome || 0) - (financialData?.monthlyExpenses || 0)).toLocaleString()}</p></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="Monthly Cash Flow">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#4c6ef5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Asset Allocation">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Accounts"><DataTable columns={accountColumns} data={accounts} /></Card>
        <Card title="Monthly Bills"><DataTable columns={billColumns} data={bills || []} /></Card>
      </div>
    </div>
  );
}
