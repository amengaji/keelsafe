// web/src/context/ThemeContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Check local storage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('keelsafe_web_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('keelsafe_web_theme', theme);
    // Apply theme to the body for global background colors
    document.body.style.backgroundColor = theme === 'dark' ? '#0F172A' : '#F8FAFC';
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useWebTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useWebTheme must be used within a ThemeProvider');
  return context;
};