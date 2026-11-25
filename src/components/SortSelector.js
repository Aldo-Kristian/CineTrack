import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MEDIA_SORT_OPTIONS } from '../constants/mediaOptions';

const SortSelector = ({ selectedSort = 'RECENT', onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
    keyboardShouldPersistTaps="handled"
  >
    <Text style={styles.prefix}>Sort:</Text>

    {MEDIA_SORT_OPTIONS.map((item) => {
      const isSelected = selectedSort === item.value;

      return (
        <Pressable
          key={item.value}
          style={[styles.option, isSelected && styles.selectedOption]}
          onPress={() => onSelect?.(item.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <Text
            style={[styles.optionText, isSelected && styles.selectedOptionText]}
          >
            {item.label}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

export default SortSelector;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  prefix: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },

  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  selectedOption: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },

  optionText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  selectedOptionText: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
});