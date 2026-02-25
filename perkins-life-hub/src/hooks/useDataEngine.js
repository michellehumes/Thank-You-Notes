import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import sampleData from '../data/sampleData.json';
import cadenceRules from '../data/cadenceRules.json';
import { processMaintenanceItems, processHealthCompliance } from '../services/recurringEngine';
import { calculateNetWorth, calculateSavingsRate, calculateEmergencyFundMonths } from '../services/forecastEngine';
import { generateAlerts } from '../services/complianceEngine';

export function useDataEngine() {
  const [events, setEvents] = useLocalStorage('events', sampleData.events);
  const [healthCompliance, setHealthCompliance] = useLocalStorage('healthCompliance', sampleData.healthCompliance);
  const [maintenanceData, setMaintenanceData] = useLocalStorage('maintenance', sampleData.maintenance);
  const [financialData, setFinancialData] = useLocalStorage('financial', sampleData.financialSummary);
  const [businessData, setBusinessData] = useLocalStorage('business', sampleData.businessMetrics);
  const [bills, setBills] = useLocalStorage('bills', sampleData.bills);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const processedMaintenance = processMaintenanceItems(maintenanceData, cadenceRules.maintenance);
  const processedHealth = processHealthCompliance(healthCompliance, cadenceRules.health);
  const alerts = generateAlerts(processedHealth, processedMaintenance, bills);
  const netWorth = calculateNetWorth(financialData.accounts || []);
  const savingsRate = calculateSavingsRate(financialData.monthlyIncome, financialData.monthlyExpenses);
  const emergencyMonths = calculateEmergencyFundMonths(
    (financialData.accounts || []).filter((a) => a.type === 'savings').reduce((s, a) => s + a.balance, 0),
    financialData.monthlyExpenses
  );

  const addEvent = useCallback((event) => {
    setEvents((prev) => [...prev, { ...event, id: `e_${Date.now()}` }]);
  }, [setEvents]);

  const removeEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, [setEvents]);

  const updateMaintenance = useCallback((id, updates) => {
    setMaintenanceData((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  }, [setMaintenanceData]);

  const updateHealthCompliance = useCallback((person, type, updates) => {
    setHealthCompliance((prev) => ({
      ...prev,
      [person]: { ...prev[person], [type]: { ...prev[person]?.[type], ...updates } },
    }));
  }, [setHealthCompliance]);

  return {
    events, addEvent, removeEvent,
    healthCompliance: processedHealth,
    maintenance: processedMaintenance, updateMaintenance,
    financialData, netWorth, savingsRate, emergencyMonths,
    businessData,
    bills,
    alerts,
    isOnline,
    rawHealthCompliance: healthCompliance, updateHealthCompliance,
    rawMaintenance: maintenanceData,
  };
}
