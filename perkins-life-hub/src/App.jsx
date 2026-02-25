import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDataEngine } from './hooks/useDataEngine';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import FinancePage from './pages/FinancePage';
import HealthPage from './pages/HealthPage';
import MaintenancePage from './pages/MaintenancePage';
import DocumentsPage from './pages/DocumentsPage';
import BusinessPage from './pages/BusinessPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const data = useDataEngine();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout alerts={data.alerts} isOnline={data.isOnline} />}>
          <Route index element={<DashboardPage data={data} />} />
          <Route path="calendar" element={<CalendarPage data={data} />} />
          <Route path="finance" element={<FinancePage data={data} />} />
          <Route path="health" element={<HealthPage data={data} />} />
          <Route path="maintenance" element={<MaintenancePage data={data} />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="business" element={<BusinessPage data={data} />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
