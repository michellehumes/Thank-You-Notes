import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(`plh_${key}`);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`plh_${key}`, JSON.stringify(value));
    } catch { /* storage full or private mode */ }
  }, [key, value]);

  const remove = () => {
    localStorage.removeItem(`plh_${key}`);
    setValue(initialValue);
  };

  return [value, setValue, remove];
}
