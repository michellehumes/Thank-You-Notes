export default function Card({ title, subtitle, children, action, className = '' }) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-lg ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <div>
            {title && <h3 className="text-[14px] font-semibold text-neutral-900">{title}</h3>}
            {subtitle && <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
