export default function DataTable({ columns, data, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-neutral-500 text-[13px]">{emptyMessage}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-neutral-200">
            {columns.map((col) => (
              <th key={col.key} className={`text-left py-2 px-3 text-[11px] uppercase tracking-wide text-neutral-500 font-semibold ${col.align === 'right' ? 'text-right' : ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`py-2.5 px-3 ${col.align === 'right' ? 'text-right' : ''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
