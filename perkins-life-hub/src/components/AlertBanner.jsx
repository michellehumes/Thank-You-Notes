import { AlertTriangle, AlertCircle, Info, X, ArrowRight } from 'lucide-react';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertTriangle, iconColor: 'text-red-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: AlertCircle, iconColor: 'text-amber-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-500' },
};

export default function AlertBanner({ alerts = [], onDismiss, maxShow = 5 }) {
  if (alerts.length === 0) return null;
  const shown = alerts.slice(0, maxShow);
  return (
    <div className="space-y-2 mb-6">
      {shown.map((alert) => {
        const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
        const Icon = style.icon;
        return (
          <div key={alert.id} className={`${style.bg} ${style.border} border rounded-lg px-4 py-2.5 flex items-center gap-3`}>
            <Icon size={16} className={style.iconColor} />
            <div className="flex-1 min-w-0">
              <span className={`text-[13px] font-medium ${style.text}`}>{alert.title}</span>
              <span className={`text-[12px] ${style.text} opacity-75 ml-2`}>{alert.message}</span>
            </div>
            {alert.action && (
              <button className="text-[11px] text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1 whitespace-nowrap">
                {alert.action} <ArrowRight size={10} />
              </button>
            )}
            {onDismiss && (
              <button onClick={() => onDismiss(alert.id)} className="text-neutral-400 hover:text-neutral-600">
                <X size={14} />
              </button>
            )}
          </div>
        );
      })}
      {alerts.length > maxShow && (
        <p className="text-[11px] text-neutral-500 text-center">+{alerts.length - maxShow} more alerts</p>
      )}
    </div>
  );
}
