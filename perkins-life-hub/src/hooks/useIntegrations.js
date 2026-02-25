import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import config from '../data/config.json';

export function useIntegrations() {
  const [integrationStatus, setIntegrationStatus] = useLocalStorage('integrations', {
    googleCalendar: { connected: false, lastSync: null },
    googleDrive: { connected: false, lastSync: null },
    gmail: { connected: false, lastSync: null },
    plaid: { connected: false, lastSync: null },
    etsy: { connected: false, lastSync: null },
  });

  const isEnabled = useCallback((name) => {
    return config.integrations?.[name]?.enabled ?? false;
  }, []);

  const isConnected = useCallback((name) => {
    return integrationStatus[name]?.connected ?? false;
  }, [integrationStatus]);

  const setConnected = useCallback((name, connected) => {
    setIntegrationStatus((prev) => ({
      ...prev,
      [name]: { ...prev[name], connected, lastSync: connected ? new Date().toISOString() : null },
    }));
  }, [setIntegrationStatus]);

  const updateLastSync = useCallback((name) => {
    setIntegrationStatus((prev) => ({
      ...prev,
      [name]: { ...prev[name], lastSync: new Date().toISOString() },
    }));
  }, [setIntegrationStatus]);

  return { integrationStatus, isEnabled, isConnected, setConnected, updateLastSync };
}
