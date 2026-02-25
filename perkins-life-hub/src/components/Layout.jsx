import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, DollarSign, Heart, Wrench, FolderOpen, ShoppingBag, Settings, Bell, Wifi, WifiOff } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/health', icon: Heart, label: 'Health' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/documents', icon: FolderOpen, label: 'Documents' },
  { to: '/business', icon: ShoppingBag, label: 'Business' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ alerts = [], isOnline = true }) {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  return (
    <div className="flex h-screen bg-white">
      <aside className="w-56 border-r border-neutral-200 bg-neutral-50 flex flex-col">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h1 className="text-base font-bold text-neutral-900 tracking-tight">PERKINS LIFE HUB</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">Executive Dashboard</p>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2 text-[13px] transition-colors ${isActive ? 'text-primary-700 bg-primary-50 font-semibold border-r-2 border-primary-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`
            }>
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-3 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            {isOnline ? <Wifi size={12} className="text-success" /> : <WifiOff size={12} className="text-danger" />}
            {isOnline ? 'Connected' : 'Offline Mode'}
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        {criticalCount > 0 && (
          <div className="bg-danger/5 border-b border-danger/20 px-6 py-2 flex items-center gap-2">
            <Bell size={14} className="text-danger" />
            <span className="text-[12px] text-danger font-medium">{criticalCount} critical alert{criticalCount > 1 ? 's' : ''} requiring attention</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
