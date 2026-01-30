// mobile/src/context/PermitContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Permit, PermitStatus } from '../types/permitTypes';
import { MOCK_PERMITS } from '../constants/mockData';

const STORAGE_KEY = '@keelsafe_permits_v1';

interface PermitContextType {
  permits: Permit[];
  createPermit: (newPermit: Permit) => void;
  updatePermitStatus: (id: string, status: PermitStatus) => void;
  getPermit: (id: string) => Permit | undefined;
  updatePermitData: (updatedPermit: Permit) => void; // <--- NEW FUNCTION
  isLoading: boolean;
}

const PermitContext = createContext<PermitContextType | undefined>(undefined);

export const PermitProvider = ({ children }: { children: ReactNode }) => {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. LOAD ON STARTUP ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          const parsed = JSON.parse(jsonValue, (key, value) => {
             if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                 return new Date(value);
             }
             return value;
          });
          setPermits(parsed);
        } else {
          setPermits(MOCK_PERMITS);
        }
      } catch (e) {
        console.error("Failed to load permits", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 2. SAVE ON CHANGE ---
  useEffect(() => {
    if (!isLoading) {
        const saveData = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(permits));
            } catch (e) {
                console.error("Failed to save permits", e);
            }
        };
        saveData();
    }
  }, [permits, isLoading]);

  // --- ACTIONS ---

  const createPermit = (newPermit: Permit) => {
    setPermits(prev => [newPermit, ...prev]);
  };

  const updatePermitStatus = (id: string, status: PermitStatus) => {
    setPermits(prev => prev.map(p => 
      p.permitId === id ? { ...p, status, updatedAt: new Date() } : p
    ));
  };

  // NEW: Save ANY change to the permit (Logs, Counts, Gas)
  const updatePermitData = (updatedPermit: Permit) => {
    setPermits(prev => prev.map(p => 
      p.id === updatedPermit.id ? { ...updatedPermit, updatedAt: new Date(), version: p.version + 1 } : p
    ));
  };

  const getPermit = (id: string) => {
    return permits.find(p => p.permitId === id);
  };

  return (
    <PermitContext.Provider value={{ permits, createPermit, updatePermitStatus, getPermit, updatePermitData, isLoading }}>
      {children}
    </PermitContext.Provider>
  );
};

export const usePermits = () => {
  const context = useContext(PermitContext);
  if (!context) {
    throw new Error('usePermits must be used within a PermitProvider');
  }
  return context;
};