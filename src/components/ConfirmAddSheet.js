import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import BottomSheet from './BottomSheet';
import PosterImage from './PosterImage';
import GenreList from './GenreList';
import StatusSegmented from './StatusSegmented';
import RatingInput from './RatingInput';

const ConfirmAddSheet = ({
  visible,
  data,
  isPreviewing,
  degraded,
  isAdding,
  error,
  onClose,
  onConfirm,
}) => {
  const [status, setStatus] = useState('TO_WATCH');
  const [rating, setRating] = useState(null);

  if (!data) {
    return null;
  }

  const media = {
    title: data.title,
    genre: data.genre,
    poster_path: data.poster_path,
    poster_uri: data.poster_uri,
    type: data.type,
    release_year: data.release_year,
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Add to collection"
      footer={
        <View style={styles.footer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.submit, isAdding && styles.disabled]}
            onPress={() => onConfirm({ status, rating })}
            disabled={isAdding}
            accessibilityRole="button"
            accessibilityLabel="Add to collection"
          >
            <Text style={styles.submitText}>
              {isAdding ? 'Adding...' : 'Add to Collection'}
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.hero}>
        <PosterImage media={media} style={styles.poster} />

        <View style={styles.heroInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {data.title}
          </Text>
          <Text style={styles.meta}>
            {data.type === 'SERIES' ? 'Series' : 'Movie'}
            {data.release_year ? ` · ${data.release_year}` : ''}
          </Text>

          <View style={styles.genres}>
            <GenreList genre={data.genre} size="sm" max={3} />
          </View>

          {isPreviewing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primaryLight} />
              <Text style={styles.loadingText}>Loading details...</Text>
            </View>
          ) : null}

          {degraded ? (
            <Text style={styles.degraded}>
              Some details could not be loaded. You can still add this title.
            </Text>
          ) : null}
        </View>
      </View>

      {data.description ? (
        <Text style={styles.description} numberOfLines={4}>
          {data.description}
        </Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <StatusSegmented value={status} onChange={setStatus} />
      </View>

      {status === 'COMPLETED' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your rating (optional)</Text>
          <RatingInput value={rating} onChange={setRating} />
        </View>
      ) : null}

    </BottomSheet>
  );
};

export default ConfirmAddSheet;

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: spacing.lg,
  },

  poster: {
    width: 104,
    aspectRatio: 2 / 3,
    borderRadius: 8,
  },

  heroInfo: {
    flex: 1,
    gap: spacing.sm,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  genres: {
    marginTop: spacing.xs,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  loadingText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  degraded: {
    color: colors.warning,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },

  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  section: {
    gap: spacing.sm,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  error: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
  },

  footer: {
    gap: spacing.sm,
  },

  submit: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },

  submitText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabled: {
    opacity: 0.6,
  },
});
