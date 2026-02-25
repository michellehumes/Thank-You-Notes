import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

export default function MaintenancePage({ data }) {
  const { maintenance } = data;
  const items = maintenance || [];
  const categories = [...new Set(items.map((i) => i.category))];

  const columns = [
    { key: 'label', label: 'Item' },
    { key: 'lastCompleted', label: 'Last Done', render: (v) => v ? format(new Date(v), 'MMM d, yyyy') : 'Never' },
    { key: 'nextDue', label: 'Next Due', render: (v) => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
    { key: 'daysUntil', label: 'Days', align: 'right', render: (v) => {
      if (v === null) return '—';
      if (v < 0) return <span className="text-danger font-medium">{Math.abs(v)}d overdue</span>;
      return <span className={v <= 14 ? 'text-warning' : 'text-neutral-700'}>{v}d</span>;
    }},
    { key: 'vendor', label: 'Vendor', render: (v) => v || '—' },
    { key: 'cost', label: 'Est. Cost', align: 'right', render: (v) => v ? `$${v}` : '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-4">Maintenance Tracker</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Total Items</p><p className="text-2xl font-bold">{items.length}</p></div></Card>
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Overdue</p><p className="text-2xl font-bold text-danger">{items.filter((i) => i.status === 'overdue').length}</p></div></Card>
        <Card><div className="text-center"><p className="text-[11px] text-neutral-500 uppercase">Due Soon</p><p className="text-2xl font-bold text-warning">{items.filter((i) => i.status === 'due-soon').length}</p></div></Card>
      </div>
      {categories.map((cat) => (
        <Card key={cat} title={cat.charAt(0).toUpperCase() + cat.slice(1)} className="mb-4">
          <DataTable columns={columns} data={items.filter((i) => i.category === cat)} />
        </Card>
      ))}
    </div>
  );
}
