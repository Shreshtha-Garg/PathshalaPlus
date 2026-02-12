import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* 1. Status Bar: Controls the color of the battery/time icons */}
      <StatusBar style="dark" />

      {/* 2. Navigator: Loads the Welcome Screen first */}
      <AppNavigator />
    </SafeAreaProvider>
  );
}