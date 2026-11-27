import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import {
  GENRES,
  parseGenres,
  serializeGenres,
} from '../constants/genres';
import GenreChip from './GenreChip';
import GenreList from './GenreList';
import BottomSheet from './BottomSheet';

const GenrePicker = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const selected = parseGenres(value);

  // Genre lama di luar daftar tetap ditampilkan agar bisa dilepas.
  const knownValues = GENRES.map((item) => item.value);
  const options = [
    ...knownValues,
    ...selected.filter((item) => !knownValues.includes(item)),
  ];

  const toggleGenre = (genre) => {
    const next = selected.includes(genre)
      ? selected.filter((item) => item !== genre)
      : [...selected, genre];

    onChange(serializeGenres(next));
  };

  const clearAll = () => onChange('');
  const close = () => setVisible(false);

  return (
    <>
      <Pressable
        style={styles.field}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Choose genres"
      >
        <View style={styles.fieldContent}>
          {selected.length > 0 ? (
            <GenreList genre={value} size="md" />
          ) : (
            <Text style={styles.placeholder}>Choose genres</Text>
          )}
        </View>

        <ChevronDown size={20} color={colors.textMuted} />
      </Pressable>

      <BottomSheet
        visible={visible}
        onClose={close}
        title="Select genres"
        headerContent={
          <Text style={styles.count}>{selected.length} selected</Text>
        }
        footer={
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.clearButton,
                selected.length === 0 && styles.disabledButton,
              ]}
              onPress={clearAll}
              disabled={selected.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Clear genres"
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>

            <Pressable
              style={styles.doneButton}
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Done selecting genres"
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        }
      >
        <View style={styles.board}>
          {options.map((genre) => (
            <GenreChip
              key={genre}
              label={genre}
              size="md"
              selected={selected.includes(genre)}
              onPress={() => toggleGenre(genre)}
            />
          ))}
        </View>
      </BottomSheet>
    </>
  );
};

export default GenrePicker;

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },

  fieldContent: {
    flex: 1,
  },

  placeholder: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },

  count: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  clearButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  clearText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  doneButton: {
    flex: 2,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },

  doneText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabledButton: {
    opacity: 0.4,
  },
});
