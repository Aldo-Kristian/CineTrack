import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MEDIA_STATUSES } from '../constants/mediaOptions';

const StatusFilter = ({ selectedStatus, onSelect }) => {
  const filters = [
    { label: 'All', value: 'ALL' },
    ...MEDIA_STATUSES,
  ];

  return (
    <View style={styles.container}>
      {filters.map((item) => {
        const isSelected = selectedStatus === item.value;

        return (
          <Pressable
            key={item.value}
            style={[
              styles.option,
              isSelected && styles.selectedOption,
            ]}
            onPress={() => onSelect(item.value)}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default StatusFilter;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
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
