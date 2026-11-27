import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { mapTmdbSearchResult } from '../services/tmdbMapper';
import PosterImage from './PosterImage';

const TmdbSearchResultItem = ({ result, inCollection, onPress, compact = false }) => {
  const mapped = mapTmdbSearchResult(result);

  return (
    <Pressable
      onPress={() => onPress?.(result)}
      disabled={inCollection}
      style={({ pressed }) => [
        styles.row,
        compact && styles.rowCompact,
        pressed && !inCollection && styles.pressed,
        inCollection && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${mapped.title}, ${mapped.release_year || 'year unknown'}${
        inCollection ? ', already in collection' : ''
      }`}
    >
      <PosterImage
        media={mapped}
        style={[styles.poster, compact && styles.posterCompact]}
        size="w185"
      />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {mapped.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {mapped.type === 'SERIES' ? 'Series' : 'Movie'}
            </Text>
          </View>

          {mapped.release_year ? (
            <Text style={styles.year}>{mapped.release_year}</Text>
          ) : null}
        </View>
      </View>

      {inCollection ? (
        <View style={styles.collectionBadge}>
          <Text style={styles.collectionText}>In collection</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export default memo(TmdbSearchResultItem);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 92,
  },

  rowCompact: {
    minHeight: 68,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },

  pressed: {
    backgroundColor: colors.surfaceSecondary,
  },

  disabled: {
    opacity: 0.55,
  },

  poster: {
    width: 48,
    aspectRatio: 2 / 3,
    borderRadius: 6,
  },

  posterCompact: {
    width: 40,
  },

  info: {
    flex: 1,
    gap: spacing.xs,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  typeBadge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  typeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },

  year: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  collectionBadge: {
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },

  collectionText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
});
