import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { getGenreColor } from '../constants/genres';

const GenreChip = ({ label, selected = false, size = 'md', onPress }) => {
  const color = getGenreColor(label);
  const isSmall = size === 'sm';

  const containerStyle = [
    styles.chip,
    isSmall ? styles.chipSmall : styles.chipMedium,
    {
      backgroundColor: selected ? color : `${color}26`,
      borderColor: selected ? color : `${color}80`,
    },
  ];

  const textStyle = [
    styles.text,
    isSmall ? styles.textSmall : styles.textMedium,
    { color: selected ? colors.background : color },
    selected && styles.textSelected,
  ];

  const content = (
    <>
      {selected && onPress ? (
        <Check size={14} color={colors.background} />
      ) : null}
      <Text style={textStyle}>{label}</Text>
    </>
  );

  if (!onPress) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <Pressable
      style={containerStyle}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {content}
    </Pressable>
  );
};

export default GenreChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: 8,
  },

  chipSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },

  chipMedium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  text: {
    fontWeight: typography.fontWeight.medium,
  },

  textSmall: {
    fontSize: typography.fontSize.xs,
  },

  textMedium: {
    fontSize: typography.fontSize.sm,
  },

  textSelected: {
    fontWeight: typography.fontWeight.bold,
  },
});