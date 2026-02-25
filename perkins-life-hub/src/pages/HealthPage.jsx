import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

export default function HealthPage({ data }) {
  const { healthCompliance } = data;

  const columns = [
    { key: 'label', label: 'Appointment' },
    { key: 'lastVisit', label: 'Last Visit', render: (v) => v ? format(new Date(v), 'MMM d, yyyy') : 'Never' },
    { key: 'nextDue', label: 'Next Due', render: (v) => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
    { key: 'daysUntil', label: 'Days Until', align: 'right', render: (v, row) => {
      if (v === null) return '—';
      if (v < 0) return <span className="text-danger font-medium">{Math.abs(v)} overdue</span>;
      return <span className={v <= 30 ? 'text-warning' : 'text-neutral-700'}>{v} days</span>;
    }},
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'needsBooking', label: 'Action', render: (v) => v ? <span className="text-[11px] px-2 py-0.5 bg-red-50 text-danger rounded font-medium">Needs Booking</span> : null },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-4">Health Compliance</h2>
      {Object.entries(healthCompliance || {}).map(([person, items]) => (
        <Card key={person} title={person === 'michelle' ? 'Michelle Perkins' : 'Gray Perkins'} className="mb-4">
          <DataTable columns={columns} data={items} emptyMessage="No health appointments tracked" />
        </Card>
      ))}
    </div>
  );
}
