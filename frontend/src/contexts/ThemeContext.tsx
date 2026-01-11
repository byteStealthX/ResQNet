import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  success: string;
  warning: string;
  info: string;
}

const defaultColors: ThemeColors = {
  primary: '0 84% 60%',
  success: '160 84% 39%',
  warning: '38 92% 50%',
  info: '217 91% 60%',
};

const colorPresets: Record<string, ThemeColors> = {
  emergency: {
    primary: '0 84% 60%',
    success: '160 84% 39%',
    warning: '38 92% 50%',
    info: '217 91% 60%',
  },
  ocean: {
    primary: '200 84% 50%',
    success: '160 84% 39%',
    warning: '38 92% 50%',
    info: '240 84% 60%',
  },
  forest: {
    primary: '142 76% 36%',
    success: '160 84% 39%',
    warning: '38 92% 50%',
    info: '217 91% 60%',
  },
  sunset: {
    primary: '25 95% 53%',
    success: '160 84% 39%',
    warning: '45 93% 47%',
    info: '217 91% 60%',
  },
  purple: {
    primary: '270 76% 55%',
    success: '160 84% 39%',
    warning: '38 92% 50%',
    info: '240 84% 60%',
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  setColors: (colors: ThemeColors) => void;
  colorPreset: string;
  setColorPreset: (preset: string) => void;
  colorPresets: Record<string, ThemeColors>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });
  
  const [colorPreset, setColorPreset] = useState(() => {
    return localStorage.getItem('colorPreset') || 'emergency';
  });
  
  const [colors, setColors] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem('themeColors');
    return saved ? JSON.parse(saved) : defaultColors;
  });

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply color variables
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--destructive', colors.primary);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--warning', colors.warning);
    root.style.setProperty('--info', colors.info);
    root.style.setProperty('--critical', colors.primary);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-ring', colors.primary);
    
    localStorage.setItem('themeColors', JSON.stringify(colors));
  }, [colors]);

  // Handle preset changes
  useEffect(() => {
    if (colorPresets[colorPreset]) {
      setColors(colorPresets[colorPreset]);
    }
    localStorage.setItem('colorPreset', colorPreset);
  }, [colorPreset]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colors,
        setColors,
        colorPreset,
        setColorPreset,
        colorPresets,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
