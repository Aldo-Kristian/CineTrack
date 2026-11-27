import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import ModalSheet from './ModalSheet';

export const COUNTRY_OPTIONS = [
  { code: 'ID', name: 'Indonesia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'TR', name: 'Turkey' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NZ', name: 'New Zealand' },
];

const RegionPicker = ({ visible, value, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState('');

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return COUNTRY_OPTIONS;
    }

    return COUNTRY_OPTIONS.filter(
      (item) =>
        item.code.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword)
    );
  }, [query]);

  const customCode = custom.trim().toUpperCase();
  const customValid = /^[A-Z]{2}$/.test(customCode);

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Streaming region">
      <Text style={styles.help}>
        Providers and availability are fetched for this country. Use the
        ISO 3166-1 two-letter code.
      </Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search country..."
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {filtered.map((item) => {
        const selected = value === item.code;

        return (
          <Pressable
            key={item.code}
            onPress={() => {
              onSelect(item.code);
              onClose();
            }}
            style={styles.row}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${item.name} (${item.code})`}
          >
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.name}>{item.name}</Text>
            {selected ? <Check size={18} color={colors.success} /> : null}
          </Pressable>
        );
      })}

      <View style={styles.customBox}>
        <Text style={styles.customTitle}>Other country code</Text>
        <View style={styles.customRow}>
          <TextInput
            style={[styles.input, styles.customInput]}
            value={custom}
            onChangeText={(text) =>
              setCustom(text.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())
            }
            placeholder="e.g. ID"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            autoCapitalize="characters"
            maxLength={2}
          />

          <Pressable
            style={[styles.useButton, !customValid && styles.disabled]}
            disabled={!customValid}
            onPress={() => {
              onSelect(customCode);
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Use custom country code"
          >
            <Text style={styles.useText}>Use</Text>
          </Pressable>
        </View>
      </View>
    </ModalSheet>
  );
};

export default RegionPicker;

const styles = StyleSheet.create({
  help: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },

  row: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  code: {
    width: 32,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },

  name: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },

  customBox: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },

  customTitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  customRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  customInput: {
    flex: 1,
  },

  useButton: {
    minWidth: 84,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },

  useText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabled: {
    opacity: 0.4,
  },
});
