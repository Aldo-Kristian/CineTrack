import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MEDIA_STATUSES } from '../constants/mediaOptions';
import { getStatusColor } from '../utils/formatters';

const StatusSegmented = ({
  value,
  onChange,
  compact = false,
  disabled = false,
}) => {
  return (
    <View style={styles.row}>
      {MEDIA_STATUSES.map((item) => {
        const selected = value === item.value;
        const accent = getStatusColor(item.value);

        return (
          <Pressable
            key={item.value}
            onPress={() => onChange?.(item.value)}
            disabled={disabled}
            style={[
              styles.option,
              compact && styles.optionCompact,
              selected && { backgroundColor: `${accent}26`, borderColor: accent },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Set status ${item.label}`}
          >
            <View style={[styles.dot, { backgroundColor: accent }]} />
            <Text
              style={[
                styles.label,
                selected && { color: accent, fontWeight: typography.fontWeight.semibold },
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

export default StatusSegmented;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  option: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },

  optionCompact: {
    minHeight: 40,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
});
