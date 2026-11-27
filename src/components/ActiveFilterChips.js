import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MEDIA_SORT_OPTIONS, MEDIA_STATUSES, MEDIA_TYPES } from '../constants/mediaOptions';

const labelFor = (kind, value) => {
  if (kind === 'type') {
    return MEDIA_TYPES.find((item) => item.value === value)?.label ?? value;
  }

  if (kind === 'status') {
    return MEDIA_STATUSES.find((item) => item.value === value)?.label ?? value;
  }

  if (kind === 'sortBy') {
    return `Sort: ${
      MEDIA_SORT_OPTIONS.find((item) => item.value === value)?.label ?? value
    }`;
  }

  return value;
};

const ActiveFilterChips = ({ filters, onRemove }) => {
  const active = [
    filters.type !== 'ALL' ? { kind: 'type', value: filters.type } : null,
    filters.status !== 'ALL' ? { kind: 'status', value: filters.status } : null,
    filters.genre !== 'ALL' ? { kind: 'genre', value: filters.genre } : null,
    filters.sortBy !== 'RECENT'
      ? { kind: 'sortBy', value: filters.sortBy }
      : null,
  ].filter(Boolean);

  if (active.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {active.map((item) => (
        <Pressable
          key={`${item.kind}-${item.value}`}
          onPress={() => onRemove(item.kind)}
          style={styles.chip}
          accessibilityRole="button"
          accessibilityLabel={`Remove filter ${labelFor(item.kind, item.value)}`}
        >
          <Text style={styles.text}>{labelFor(item.kind, item.value)}</Text>
          <X size={14} color={colors.textSecondary} />
        </Pressable>
      ))}
    </View>
  );
};

export default ActiveFilterChips;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },

  text: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
});
