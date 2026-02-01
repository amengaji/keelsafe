// mobile/src/context/CrewContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CrewMember } from '../types/permitTypes';
import { CREW_DATABASE } from '../constants/crewData';

const CREW_STORAGE_KEY = '@keelsafe_crew_v1';

interface CrewContextType {
  crew: CrewMember[];
  addCrewMember: (newMember: CrewMember) => void;
  updateCrewMember: (updatedMember: CrewMember) => void;
  deleteCrewMember: (id: string) => void;
  resetCrewPin: (id: string, newPin: string) => void;
  isLoading: boolean;
}

const CrewContext = createContext<CrewContextType | undefined>(undefined);

export const CrewProvider = ({ children }: { children: ReactNode }) => {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. LOAD CREW ON STARTUP ---
  useEffect(() => {
    const loadCrew = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(CREW_STORAGE_KEY);
        if (jsonValue != null) {
          setCrew(JSON.parse(jsonValue));
        } else {
          // If no saved data, use the initial hardcoded list
          setCrew(CREW_DATABASE);
        }
      } catch (e) {
        console.error("Failed to load crew database", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCrew();
  }, []);

  // --- 2. SAVE CREW ON CHANGE ---
  useEffect(() => {
    if (!isLoading) {
      const saveCrew = async () => {
        try {
          await AsyncStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(crew));
        } catch (e) {
          console.error("Failed to save crew database", e);
        }
      };
      saveCrew();
    }
  }, [crew, isLoading]);

  // --- ACTIONS ---

  const addCrewMember = (newMember: CrewMember) => {
    setCrew(prev => [...prev, newMember]);
  };

  const updateCrewMember = (updatedMember: CrewMember) => {
    setCrew(prev => prev.map(member => 
      member.id === updatedMember.id ? updatedMember : member
    ));
  };

  const deleteCrewMember = (id: string) => {
    setCrew(prev => prev.filter(member => member.id !== id));
  };

  const resetCrewPin = (id: string, newPin: string) => {
    setCrew(prev => prev.map(member => 
      member.id === id ? { ...member, pin: newPin } : member
    ));
  };

  return (
    <CrewContext.Provider value={{ crew, addCrewMember, updateCrewMember, deleteCrewMember, resetCrewPin, isLoading }}>
      {children}
    </CrewContext.Provider>
  );
};

export const useCrew = () => {
  const context = useContext(CrewContext);
  if (!context) {
    throw new Error('useCrew must be used within a CrewProvider');
  }
  return context;
};