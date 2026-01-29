// mobile/src/navigation/AppNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/permitTypes';
import { useTheme } from 'react-native-paper';

// Import our new Tab Navigator
import MainTabNavigator from './MainTabNavigator';

// Import screens that shouldn't have bottom tabs (like the Wizard)
import WizardScreen from '../screens/PermitWizard/WizardScreen';
import ActivePermitScreen from '../screens/ActivePermit/ActivePermitScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false, // We let the TabNavigator handle the header for main screens
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      {/* 1. The Main Layout (Dashboard + Bottom Tabs) */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
      />
      
      {/* 2. Full Screen Flows (No Bottom Tabs) */}
      <Stack.Screen 
        name="PermitWizard" 
        component={WizardScreen} 
        options={{ 
            headerShown: true,
            title: 'New Permit Application',
            headerStyle: { backgroundColor: theme.colors.primary },
            headerTintColor: '#FFF'
        }}
      />
      
      <Stack.Screen 
        name="ActivePermit" 
        component={ActivePermitScreen} 
        options={{ 
            headerShown: true, 
            title: 'Permit Details',
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.onSurface
        }}
      />
    </Stack.Navigator>
  );
}