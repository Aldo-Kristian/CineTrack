import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import StatusBadge from './StatusBadge';
import GenreList from './GenreList';
import PosterImage from './PosterImage';
import CardStreaming from './CardStreaming';
import { CardMeta, CardOverflowButton, CardRating } from './CardPieces';

const MediaCardPoster = ({
  media,
  theme,
  card,
  onPress,
  onLongPress,
  onOpenActions,
}) => (
  <Pressable
    onPress={() => onPress?.(media)}
    onLongPress={() => onLongPress?.(media)}
    android_ripple={{ color: colors.surfaceSecondary }}
    style={[
      styles.container,
      { borderRadius: theme.radius, borderColor: colors.border },
    ]}
    accessibilityRole="button"
    accessibilityLabel={`${media.title}, ${card.typeLabel}${
      card.year ? ` ${card.year}` : ''
    }`}
  >
    <View style={styles.row}>
      <PosterImage
        media={media}
        style={styles.poster}
        recyclingKey={`poster-${media.id}`}
      />

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {media.title}
          </Text>
          <CardRating value={media.rating} />
          <CardOverflowButton media={media} onOpenActions={onOpenActions} />
        </View>

        <CardMeta typeLabel={card.typeLabel} year={card.year} />

        {card.genres.length > 0 ? (
          <GenreList genre={media.genre} size="sm" max={2} />
        ) : null}

        <StatusBadge status={media.status} />
      </View>
    </View>

    <CardStreaming
      media={media}
      primary={card.primary}
      secondary={card.secondary}
      accent={theme.accent}
      compact
    />
  </Pressable>
);

export default memo(MediaCardPoster);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  poster: {
    width: 88,
    aspectRatio: 2 / 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },

  info: {
    flex: 1,
    gap: spacing.xs,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  title: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
