import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';
import AddMediaScreen from '../screens/AddMediaScreen';
import EditMediaScreen from '../screens/EditMediaScreen';
import MediaDetailsScreen from '../screens/MediaDetailsScreen';
import BackupScreen from '../screens/BackupScreen';
import colors from '../constants/colors';
import typography from '../constants/typography';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.semibold,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AddMedia"
        component={AddMediaScreen}
        options={{ title: 'Add Media' }}
      />

      <Stack.Screen
        name="MediaDetails"
        component={MediaDetailsScreen}
        options={{ title: 'Media Details' }}
      />

      <Stack.Screen
        name="EditMedia"
        component={EditMediaScreen}
        options={{ title: 'Edit Media' }}
      />

      <Stack.Screen
        name="Backup"
        component={BackupScreen}
        options={{ title: 'Backup & Restore' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;