'use client';
import { ThemeContext, useThemeState } from '../../hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeState = useThemeState();

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}
