// mobile/src/AppContent.tsx

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './context/ThemeContext'; // Import our new engine
import AppNavigator from './navigation/AppNavigator';

export default function AppContent() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
            <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}