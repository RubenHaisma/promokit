import React, { createContext, useContext, ReactNode } from 'react';
import { PromoConfig } from '../types';

const PromoContext = createContext<PromoConfig | null>(null);

interface PromoProviderProps {
  config: PromoConfig;
  children: ReactNode;
}

export function PromoProvider({ config, children }: PromoProviderProps) {
  return (
    <PromoContext.Provider value={config}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  const context = useContext(PromoContext);
  if (!context) {
    throw new Error('usePromo must be used within a PromoProvider');
  }
  return context;
}