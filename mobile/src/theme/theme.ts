// mobile/src/theme/theme.ts

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Maritime Teal - The core color of the application
const MARITIME_TEAL = '#3194A0';

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: MARITIME_TEAL,
    onPrimary: '#FFFFFF',
    secondary: '#004D40', // A darker teal for contrast
    background: '#F5F7FA', // Light grey-blue tint (Ocean mist)
    surface: '#FFFFFF',
    error: '#B00020',
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: MARITIME_TEAL,
    onPrimary: '#FFFFFF',
    secondary: '#80CBC4',
    background: '#121212', // Standard dark
    surface: '#1E1E1E',
    error: '#CF6679',
  },
};