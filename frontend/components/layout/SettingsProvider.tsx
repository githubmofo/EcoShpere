'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { EsgConfig } from '@/lib/types';
import { getEsgConfig } from '@/lib/api-client';

interface SettingsContextType {
  esgConfig: EsgConfig | null;
  refreshConfig: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [esgConfig, setEsgConfig] = useState<EsgConfig | null>(null);

  const refreshConfig = async () => {
    try {
      const config = await getEsgConfig();
      setEsgConfig(config);
    } catch (error) {
      console.error('Failed to load ESG Config', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshConfig();
  }, []);

  return (
    <SettingsContext.Provider value={{ esgConfig, refreshConfig }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
