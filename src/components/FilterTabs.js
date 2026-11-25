import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MEDIA_TYPES } from '../constants/mediaOptions';

const FILTER_OPTIONS = [{ label: 'All', value: 'ALL' }, ...MEDIA_TYPES];

const FilterTabs = ({ selectedType = 'ALL', onSelect }) => (
  <View style={styles.container}>
    {FILTER_OPTIONS.map((option) => {
      const isSelected = selectedType === option.value;

      return (
        <Pressable
          key={option.value}
          onPress={() => onSelect?.(option.value)}
          style={[styles.tab, isSelected && styles.selectedTab]}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <Text style={[styles.label, isSelected && styles.selectedLabel]}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  selectedTab: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  selectedLabel: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default FilterTabs;