// mobile/src/navigation/MainTabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, useTheme, Icon } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <--- 1. Import this

// Types
import { BottomTabParamList } from '../types/permitTypes';
import { useAppTheme } from '../context/ThemeContext';

// Screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ActivePermitScreen from '../screens/ActivePermit/ActivePermitScreen'; 

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Custom Header Component
function CustomHeader({ navigation, route, options, back }: any) {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const title = getHeaderTitle(options, route.name);

  return (
    <Appbar.Header style={{ backgroundColor: theme.colors.surface }} elevated>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      
      <Appbar.Content title={title} titleStyle={{ fontWeight: 'bold' }} />
      
      {/* Dark Mode Toggle */}
      <Appbar.Action 
        icon={isDarkMode ? "weather-sunny" : "weather-night"} 
        onPress={toggleTheme} 
        color={theme.colors.primary}
      />
      
      {/* Notification Bell */}
      <Appbar.Action 
        icon="bell-outline" 
        onPress={() => console.log('Notifications')} 
      />
    </Appbar.Header>
  );
}

export default function MainTabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets(); // <--- 2. Measure the safe area

  return (
    <Tab.Navigator
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          // 3. Dynamic height based on system buttons
          height: 60 + insets.bottom, 
          // 4. Push content up so it's not behind the buttons
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8, 
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen as any}
        options={{
          title: 'KeelSafe',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Icon source="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="MonitorTab" 
        component={ActivePermitScreen as any}
        initialParams={{ permitId: 'MONITOR' }}
        options={{
          title: 'Monitoring',
          tabBarLabel: 'Monitor',
          tabBarIcon: ({ color, size }) => (
            <Icon source="eye" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}