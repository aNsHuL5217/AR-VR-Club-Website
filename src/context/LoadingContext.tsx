'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type LoadingContextType = {
  hasPlayed: boolean;
  setHasPlayed: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [hasPlayed, setHasPlayed] = useState(false);

  return (
    <LoadingContext.Provider value={{ hasPlayed, setHasPlayed }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}