import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { PromoClient, PromoConfig } from '@promokit/js';

const PromoContext = createContext<PromoClient | null>(null);

interface PromoProviderProps {
  config: PromoConfig;
  children: ReactNode;
}

export function PromoProvider({ config, children }: PromoProviderProps) {
  const promoClient = useMemo(() => new PromoClient(config), [config]);

  return (
    <PromoContext.Provider value={promoClient}>
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