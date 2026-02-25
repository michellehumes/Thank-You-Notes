const STATUS_CONFIG = {
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700 border-red-200' },
  'due-soon': { label: 'Due Soon', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  ok: { label: 'On Track', className: 'bg-green-100 text-green-700 border-green-200' },
  unknown: { label: 'Unknown', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  connected: { label: 'Connected', className: 'bg-green-100 text-green-700 border-green-200' },
  disconnected: { label: 'Not Connected', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
};

export default function StatusBadge({ status, label }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${config.className}`}>
      {label || config.label}
    </span>
  );
}
