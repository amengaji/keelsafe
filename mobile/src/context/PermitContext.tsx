// mobile/src/context/PermitContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Permit, PermitStatus } from '../types/permitTypes';
import { MOCK_PERMITS } from '../constants/mockData';

interface PermitContextType {
  permits: Permit[];
  createPermit: (newPermit: Permit) => void;
  updatePermitStatus: (id: string, status: PermitStatus) => void;
  getPermit: (id: string) => Permit | undefined;
}

const PermitContext = createContext<PermitContextType | undefined>(undefined);

export const PermitProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with Mock Data for now, so the app isn't empty
  const [permits, setPermits] = useState<Permit[]>(MOCK_PERMITS);

  const createPermit = (newPermit: Permit) => {
    setPermits(prev => [newPermit, ...prev]);
  };

  const updatePermitStatus = (id: string, status: PermitStatus) => {
    setPermits(prev => prev.map(p => 
      p.permitId === id ? { ...p, status } : p
    ));
  };

  const getPermit = (id: string) => {
    return permits.find(p => p.permitId === id);
  };

  return (
    <PermitContext.Provider value={{ permits, createPermit, updatePermitStatus, getPermit }}>
      {children}
    </PermitContext.Provider>
  );
};

// Custom Hook for easy access
export const usePermits = () => {
  const context = useContext(PermitContext);
  if (!context) {
    throw new Error('usePermits must be used within a PermitProvider');
  }
  return context;
};