import React, { createContext, useContext, ReactNode } from 'react';
import { PromoClient } from '@promokit/js';
import { PromoConfig } from '../types';

interface PromoContextType {
  client: PromoClient;
  config: PromoConfig;
}

const PromoContext = createContext<PromoContextType | null>(null);

interface PromoProviderProps {
  config: PromoConfig;
  children: ReactNode;
}

export function PromoProvider({ config, children }: PromoProviderProps) {
  const client = new PromoClient(config);

  return (
    <PromoContext.Provider value={{ client, config }}>
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