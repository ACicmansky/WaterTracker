import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

export function ThemeToggle() {
  const { currentTheme, setTheme } = useColorScheme();

  const cycleTheme = () => {
    switch (currentTheme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('system');
        break;
      case 'system':
        setTheme('light');
        break;
    }
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'phone-portrait';
      default:
        return 'sunny';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Ionicons name="color-palette-outline" size={24} color={currentTheme === 'dark' ? '#fff' : '#666'} />
        <ThemedText style={styles.label}>App Theme</ThemedText>
      </View>
      <View style={styles.themeInfo}>
        <ThemedText style={styles.themeText}>
          {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
        </ThemedText>
        <Pressable
          onPress={cycleTheme}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
        >
          <Ionicons
            name={getThemeIcon()}
            size={24}
            color={currentTheme === 'dark' ? '#2196F3' : '#2196F3'}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    marginLeft: 8,
    color: '#666',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeText: {
    fontSize: 16,
    color: '#666',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  iconButtonPressed: {
    backgroundColor: '#e0e0e0',
  },
});
