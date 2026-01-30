// mobile/App.tsx

import React from 'react';
import AppContent from './src/AppContent';
import { PermitProvider } from './src/context/PermitContext';
import { AppThemeProvider } from './src/context/ThemeContext'; // <--- Import

/**
 * KeelSafe Mobile Entry Point
 * 1. ThemeProvider (Visuals)
 * 2. PermitProvider (Data)
 * 3. AppContent (Navigation & UI)
 */
export default function App() {
  return (
    <AppThemeProvider>
        <PermitProvider> 
            <AppContent />
        </PermitProvider>
    </AppThemeProvider>
  );
}