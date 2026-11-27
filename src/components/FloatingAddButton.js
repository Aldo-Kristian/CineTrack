import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../constants/colors';
import {
  FAB_MARGIN,
  FAB_SIZE,
  MAX_CONTENT_WIDTH,
} from '../constants/layout';
import useKeyboardHeight from '../hooks/useKeyboardHeight';

const FloatingAddButton = ({ onPress, hasTabBar = true }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();

  if (keyboardHeight > 0) {
    return null;
  }

  const bottom = FAB_MARGIN + (hasTabBar ? 0 : insets.bottom);
  const right =
    Math.max(0, (width - MAX_CONTENT_WIDTH) / 2) + FAB_MARGIN;

  return (
    <View
      style={styles.overlay}
      pointerEvents="box-none"
      collapsable={false}
    >
      <Pressable
        style={[styles.button, { bottom, right }]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Add media"
        android_ripple={{ color: colors.primaryDark }}
      >
        <Plus size={26} color={colors.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },

  button: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 20,
    zIndex: 20,
  },
});

export default FloatingAddButton;
