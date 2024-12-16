import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ExpoRoot } from 'expo-router';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ExpoRoot context={require.context('app')} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
