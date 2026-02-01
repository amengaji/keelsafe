// mobile/App.tsx

import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppThemeProvider } from './src/context/ThemeContext';
import { PermitProvider } from './src/context/PermitContext';
import { CrewProvider } from './src/context/CrewContext'; // <--- Added this
import AppContent from './src/AppContent';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <CrewProvider>
          <PermitProvider>
            <PaperProvider>
              <AppContent />
            </PaperProvider>
          </PermitProvider>
        </CrewProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}