import React, { createContext, useCallback, useContext, useState, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // v4: frosted glass over the cinematic backdrop — light type is required
    // for legibility, so the dark token set is the default. Migrate once.
    if (!localStorage.getItem('theme-v4')) {
      localStorage.setItem('theme-v4', '1');
      localStorage.setItem('theme', 'dark');
      return 'dark';
    }
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Same reasoning as AuthContext: ThemeProvider wraps the whole app, so an
  // unmemoized value object would re-render every useTheme() consumer on any
  // ThemeProvider re-render, not just an actual theme change.
  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
