import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'theme';

export type ThemeType = 'light' | 'dark' | 'system';

export interface ColorSchemeManager {
  colorScheme: 'light' | 'dark';
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
}

export function useColorScheme(): ColorSchemeManager {
  const systemTheme = useNativeColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');

  useEffect(() => {
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

  // Return the actual theme value based on setting
  return {
    colorScheme: theme === 'system' ? systemTheme || 'light' : theme,
    currentTheme: theme,
    setTheme
  };
}
