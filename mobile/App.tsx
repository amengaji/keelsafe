// mobile/App.tsx

import React from 'react';
import AppContent from './src/AppContent';

/**
 * KeelSafe Mobile Entry Point
 * * We delegate all logic to src/AppContent to keep this file clean 
 * and strictly focused on initialization.
 */
export default function App() {
  return <AppContent />;
}