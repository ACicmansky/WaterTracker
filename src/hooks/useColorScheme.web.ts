import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeType, ColorSchemeManager } from './useColorScheme';

const THEME_KEY = 'theme';

/**
 * Web-specific implementation of useColorScheme with theme persistence
 */
export function useColorScheme(): ColorSchemeManager {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [theme, setThemeState] = useState<ThemeType>('system');
  const systemTheme = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
    // Load saved theme preference
    AsyncStorage.getItem(THEME_KEY).then((savedTheme) => {
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeState(savedTheme as ThemeType);
      }
    });
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  if (!hasHydrated) {
    return {
      colorScheme: 'light',
      currentTheme: 'system',
      setTheme
    };
  }

  return {
    colorScheme: theme === 'system' ? systemTheme || 'light' : theme,
    currentTheme: theme,
    setTheme
  };
}