import { View } from 'react-native';
import WaterTrackingScreen from './screens/WaterTrackingScreen';
import { Redirect } from 'expo-router';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Redirect href="/screens/WaterTrackingScreen" />
    </View>
  );
}
