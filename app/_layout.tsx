import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer
        screenOptions={{
          headerShown: true,
          drawerPosition: 'left',
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          drawerActiveTintColor: '#2196F3',
          drawerItemStyle: {
            display: 'none',
          },
        }}
      >
        <Drawer.Screen
          name="screens/WaterTrackingScreen"
          options={{
            drawerLabel: 'Home',
            headerTitle: 'Water Tracker',
            drawerIcon: ({ color }) => (
              <FontAwesome5 name="home" size={20} color={color} />
            ),
            drawerItemStyle: {
              display: 'flex',
            },
          }}
        />
        <Drawer.Screen
          name="screens/ProfileScreen"
          options={{
            drawerLabel: 'Profile',
            headerTitle: 'Profile',
            drawerIcon: ({ color }) => (
              <FontAwesome5 name="user" size={20} color={color} />
            ),
            drawerItemStyle: {
              display: 'flex',
            },
          }}
        />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
