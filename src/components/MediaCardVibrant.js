import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import StatusBadge from './StatusBadge';
import GenreList from './GenreList';
import PosterImage from './PosterImage';
import GenreIcon from './GenreIcon';
import CardStreaming from './CardStreaming';
import { CardMeta, CardOverflowButton, CardRating } from './CardPieces';

const MediaCardVibrant = ({
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
      styles.pressable,
      {
        borderRadius: theme.radius,
        borderColor: `${theme.accent}66`,
      },
    ]}
    accessibilityRole="button"
    accessibilityLabel={`${media.title}, ${card.typeLabel}${
      card.year ? ` ${card.year}` : ''
    }`}
  >
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { borderRadius: theme.radius }]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.sticker,
            {
              backgroundColor: `${theme.accent}26`,
              borderColor: `${theme.accent}80`,
            },
          ]}
        >
          <GenreIcon name={theme.icon} size={20} color={theme.accent} />
        </View>

        <CardOverflowButton media={media} onOpenActions={onOpenActions} />
      </View>

      <View style={styles.row}>
        <PosterImage
          media={media}
          style={[styles.poster, { borderColor: `${theme.accent}66` }]}
          recyclingKey={`vibrant-${media.id}`}
        />

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {media.title}
            </Text>
            <CardRating value={media.rating} />
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
    </LinearGradient>
  </Pressable>
);

export default memo(MediaCardVibrant);

const styles = StyleSheet.create({
  pressable: {
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },

  container: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sticker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  poster: {
    width: 100,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    borderWidth: 1,
  },

  info: {
    flex: 1,
    gap: spacing.xs,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  title: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});
