import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { GENRES } from '../constants/genres';
import {
  MEDIA_SORT_OPTIONS,
  MEDIA_STATUSES,
  MEDIA_TYPES,
} from '../constants/mediaOptions';
import BottomSheet from './BottomSheet';

const DEFAULT_FILTERS = {
  type: 'ALL',
  status: 'ALL',
  genre: 'ALL',
  sortBy: 'RECENT',
};

const OptionChip = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityLabel={label}
  >
    <Text
      style={[styles.chipText, selected && styles.chipTextSelected]}
      numberOfLines={1}
      maxFontSizeMultiplier={1.3}
    >
      {label}
    </Text>
  </Pressable>
);

const FilterSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.options}>{children}</View>
  </View>
);

const FilterSheet = ({ visible, filters, onClose, onApply }) => {
  const [draft, setDraft] = useState({ ...filters });

  const setField = (field, value) =>
    setDraft((current) => ({ ...current, [field]: value }));

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filter & Sort"
      footer={
        <View style={styles.actions}>
          <Pressable
            style={styles.reset}
            onPress={() => setDraft({ ...DEFAULT_FILTERS })}
            accessibilityRole="button"
            accessibilityLabel="Reset filters"
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>

          <Pressable
            style={styles.apply}
            onPress={() => onApply(draft)}
            accessibilityRole="button"
            accessibilityLabel="Apply filters"
          >
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      }
    >
      <FilterSection title="Type">
        {[{ label: 'All', value: 'ALL' }, ...MEDIA_TYPES].map((item) => (
          <OptionChip
            key={item.value}
            label={item.label}
            selected={draft.type === item.value}
            onPress={() => setField('type', item.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Status">
        {[{ label: 'All', value: 'ALL' }, ...MEDIA_STATUSES].map((item) => (
          <OptionChip
            key={item.value}
            label={item.label}
            selected={draft.status === item.value}
            onPress={() => setField('status', item.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Genre">
        {[{ label: 'All', value: 'ALL' }, ...GENRES].map((item) => (
          <OptionChip
            key={item.value}
            label={item.value}
            selected={draft.genre === item.value}
            onPress={() => setField('genre', item.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Sort by">
        {MEDIA_SORT_OPTIONS.map((item) => (
          <OptionChip
            key={item.value}
            label={item.label}
            selected={draft.sortBy === item.value}
            onPress={() => setField('sortBy', item.value)}
          />
        ))}
      </FilterSection>

    </BottomSheet>
  );
};

export default FilterSheet;

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },

  chipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },

  chipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  chipTextSelected: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
  },

  reset: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  resetText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  apply: {
    flex: 2,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },

  applyText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});
