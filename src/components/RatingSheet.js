import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import BottomSheet from './BottomSheet';
import RatingInput from './RatingInput';

const RatingSheet = ({ visible, media, onClose, onSave, isSaving = false }) => {
  const [rating, setRating] = useState(media?.rating ?? null);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Rate this title"
      scrollable={false}
      footer={
        <View style={styles.actions}>
          <Pressable
            style={styles.skip}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Skip rating"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          <Pressable
            style={[styles.save, isSaving && styles.disabled]}
            onPress={() => onSave(rating)}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save rating"
          >
            <Text style={styles.saveText}>
              {isSaving ? 'Saving...' : 'Save rating'}
            </Text>
          </Pressable>
        </View>
      }
    >
      <Text style={styles.title} numberOfLines={2}>
        {media?.title}
      </Text>
      <Text style={styles.help}>
        Completed! Add a personal rating now, or skip and do it later.
      </Text>

      <RatingInput value={rating} onChange={setRating} />

    </BottomSheet>
  );
};

export default RatingSheet;

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  help: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  skip: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  skipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  save: {
    flex: 2,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },

  saveText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabled: {
    opacity: 0.6,
  },
});
