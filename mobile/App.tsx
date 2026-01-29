// mobile/App.tsx

import React from 'react';
import AppContent from './src/AppContent';
import { PermitProvider } from './src/context/PermitContext';

/**
 * KeelSafe Mobile Entry Point
 * * We wrap the UI (AppContent) with the Data Layer (PermitProvider).
 */
export default function App() {
  return (
    <PermitProvider> 
        <AppContent />
    </PermitProvider>
  );
}