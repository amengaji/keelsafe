// mobile/src/context/ThemeContext.tsx

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { MD3LightTheme, MD3DarkTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, NavigationContainer } from '@react-navigation/native';

// Define Custom Colors if needed
const CustomLightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#00695C', // Teal
        primaryContainer: '#E0F2F1',
        background: '#F5F5F5',
        surface: '#FFFFFF',
    }
};

const CustomDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#80CBC4', // Lighter Teal for Dark Mode
        primaryContainer: '#004D40',
        background: '#121212',
        surface: '#1E1E1E',
        onSurface: '#E0E0E0',
    }
};

const { LightTheme: NavLight, DarkTheme: NavDark } = adaptNavigationTheme({
    reactNavigationLight: NavDefaultTheme,
    reactNavigationDark: NavDarkTheme,
});

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDarkMode: false, toggleTheme: () => {} });

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;
    const navTheme = isDarkMode ? NavDark : NavLight;

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <PaperProvider theme={theme}>
                {/* We pass the theme-switching logic down, but NavigationContainer usually lives in AppContent. 
                    We will handle NavigationContainer there or assume it picks up the context if wrapped. 
                    For strict separation, we just provide the PaperProvider here. */}
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);