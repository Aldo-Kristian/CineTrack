import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import initializeDatabase from './src/database/database';
import { MediaProvider } from './src/context/MediaContext';
import { SnackbarProvider } from './src/context/SnackbarContext';
import colors from './src/constants/colors';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName="cinetrack.db"
        onInit={initializeDatabase}
      >
        <MediaProvider>
          <SnackbarProvider>
            <NavigationContainer theme={navigationTheme}>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </SnackbarProvider>
        </MediaProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
