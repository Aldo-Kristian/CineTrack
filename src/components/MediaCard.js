import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import StatusBadge from './StatusBadge';
import GenreList from './GenreList';

const MAX_VISIBLE_GENRES = 3;

const MediaCard = ({ media, onPress, onLongPress }) => {
  const {
    title,
    type,
    genre,
    release_year,
    status,
    rating,
  } = media;

  const mediaType = type === 'MOVIE' ? 'Movie' : 'Series';

  const mediaInfo = [mediaType, release_year]
    .filter((value) => value !== null && value !== undefined && value !== '')
    .join(' - ');

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress?.(media)}
      onLongPress={() => onLongPress?.(media)}
      android_ripple={{ color: colors.surfaceSecondary }}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {rating !== null && rating !== undefined && (
            <View style={styles.rating}>
              <Star
                size={14}
                color={colors.warning}
                fill={colors.warning}
              />

              <Text style={styles.ratingText}>
                {Number(rating).toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.metadata} numberOfLines={1}>
          {mediaInfo}
        </Text>

        {genre ? (
          <View style={styles.genres}>
            <GenreList genre={genre} size="sm" max={MAX_VISIBLE_GENRES} />
          </View>
        ) : null}

        <View style={styles.footer}>
          <StatusBadge status={status} />
        </View>
      </View>
    </Pressable>
  );
};

export default MediaCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },

  content: {
    padding: spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  title: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  metadata: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  genres: {
    marginTop: spacing.sm,
  },

  footer: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
});