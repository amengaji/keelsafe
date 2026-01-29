// mobile/src/AppContent.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme, Icon } from 'react-native-paper';

// Types
import { RootStackParamList, BottomTabParamList } from './types/permitTypes';

// Screens
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import WizardScreen from './screens/PermitWizard/WizardScreen';
import ActivePermitScreen from './screens/ActivePermit/ActivePermitScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// --- 1. The Bottom Tabs (Dashboard & Monitor) ---
function BottomTabs() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant, borderTopWidth: 1 }
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen as any} // <--- Cast to any to silence Prop Mismatch
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Icon source="view-dashboard" size={size} color={color} />
        }}
      />
      {/* Placeholder for Monitor Tab */}
      <Tab.Screen 
        name="MonitorTab" 
        component={DashboardScreen as any} // <--- Cast to any
        options={{
          tabBarLabel: 'Monitor',
          tabBarIcon: ({ color, size }) => <Icon source="radar" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

// --- 2. The Main Stack (Wizard sits on top of Tabs) ---
export default function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
        
        {/* The Base: Dashboard Tabs */}
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        
        {/* The Modal/Wizard: Pushes on top */}
        <Stack.Screen 
            name="PermitWizard" 
            component={WizardScreen} 
            options={{ presentation: 'fullScreenModal' }} 
        />
        
        {/* The Active Monitor: Pushes on top */}
        <Stack.Screen 
            name="ActivePermit" 
            component={ActivePermitScreen} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}