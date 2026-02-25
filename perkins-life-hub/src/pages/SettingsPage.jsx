import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { Link2, Unlink, RefreshCw } from 'lucide-react';

const INTEGRATIONS = [
  { id: 'googleCalendar', name: 'Google Calendar', desc: 'Two-way calendar sync with auto-categorization', setup: 'Requires Google OAuth 2.0 credentials' },
  { id: 'googleDrive', name: 'Google Drive', desc: 'Document vault indexing and file management', setup: 'Uses same Google OAuth credentials' },
  { id: 'gmail', name: 'Gmail', desc: 'Auto-detect travel, appointments, and subscriptions', setup: 'Uses same Google OAuth credentials' },
  { id: 'plaid', name: 'Plaid (Banking)', desc: 'Real-time account balances and transaction sync', setup: 'Requires Plaid API credentials' },
  { id: 'etsy', name: 'Etsy (Shelzys Designs)', desc: 'Order tracking, revenue, and inventory management', setup: 'Requires Etsy API key' },
];

export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-4">Settings</h2>
      <Card title="Data Integrations" subtitle="Connect external services for live data" className="mb-4">
        <div className="space-y-3">
          {INTEGRATIONS.map((intg) => (
            <div key={intg.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
              <div>
                <p className="text-[13px] font-medium text-neutral-800">{intg.name}</p>
                <p className="text-[11px] text-neutral-500">{intg.desc}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{intg.setup}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="disconnected" />
                <button className="flex items-center gap-1 px-2.5 py-1 border border-neutral-300 rounded text-[11px] text-neutral-600 hover:bg-neutral-50 transition-colors">
                  <Link2 size={12} /> Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Household Settings" className="mb-4">
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between py-2 border-b border-neutral-100"><span className="text-neutral-600">Household Members</span><span className="font-medium">Michelle Perkins, Gray Perkins</span></div>
          <div className="flex justify-between py-2 border-b border-neutral-100"><span className="text-neutral-600">Timezone</span><span className="font-medium">America/New_York (EST)</span></div>
          <div className="flex justify-between py-2"><span className="text-neutral-600">Offline Mode</span><span className="font-medium text-success">Enabled</span></div>
        </div>
      </Card>
      <Card title="Setup Instructions">
        <div className="text-[13px] text-neutral-700 space-y-2">
          <p><strong>1.</strong> Copy <code className="bg-neutral-100 px-1 rounded text-[12px]">.env.example</code> to <code className="bg-neutral-100 px-1 rounded text-[12px]">.env</code></p>
          <p><strong>2.</strong> Add your Google OAuth credentials (create at console.cloud.google.com)</p>
          <p><strong>3.</strong> Add Plaid credentials (sign up at plaid.com/dashboard)</p>
          <p><strong>4.</strong> Add Etsy API key (from etsy.com/developers)</p>
          <p><strong>5.</strong> Restart the dev server after updating .env</p>
        </div>
      </Card>
    </div>
  );
}
