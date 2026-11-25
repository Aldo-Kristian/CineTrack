import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

const FloatingAddButton = ({ onPress }) => (
  <Pressable
    style={styles.button}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Add media"
    android_ripple={{ color: colors.primaryDark, borderless: true }}
  >
    <Plus size={26} color={colors.text} />
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});

export default FloatingAddButton;