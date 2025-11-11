import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Store theme preference
    localStorage.setItem('theme', theme);
    
    // Update document attributes
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme;
    
    // Update CSS custom properties for theme
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--bg', '#0f1729');
      root.style.setProperty('--surface', '#111827');
      root.style.setProperty('--card', '#0b1220');
      root.style.setProperty('--text', '#eef2ff');
      root.style.setProperty('--muted', '#cbd5e1');
    } else {
      root.style.setProperty('--bg', '#ffffff');
      root.style.setProperty('--surface', '#f8fafc');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--text', '#0f172a');
      root.style.setProperty('--muted', '#334155');
    }
  }, [theme]);

  // Listen for system theme changes (only if user hasn't explicitly set a preference)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't explicitly set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility hook to get theme-aware styles
export function useThemeStyles() {
  const { theme, isDark } = useTheme();
  
  return {
    theme,
    isDark,
    isLight: !isDark,
    // Helper for getting theme-aware colors
    getColor: (lightColor, darkColor) => isDark ? darkColor : lightColor,
    // Helper for getting theme-aware background colors
    getBgColor: (lightBg, darkBg) => isDark ? darkBg : lightBg,
  };
}

export default ThemeContext;