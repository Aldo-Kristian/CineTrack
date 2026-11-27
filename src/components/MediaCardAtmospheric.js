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

const MediaCardAtmospheric = ({
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
        borderColor: `${theme.accent}90`,
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
      <View style={styles.row}>
        <View
          style={[
            styles.posterGlow,
            {
              borderColor: theme.accent,
              shadowColor: theme.accent,
            },
          ]}
        >
          <PosterImage
            media={media}
            style={styles.poster}
            recyclingKey={`atmospheric-${media.id}`}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {media.title}
            </Text>
            <CardRating value={media.rating} light />
          </View>

          <View style={styles.metaRow}>
            <GenreIcon name={theme.icon} size={14} color={theme.accent} />
            <CardMeta typeLabel={card.typeLabel} year={card.year} light />
          </View>

          {card.genres.length > 0 ? (
            <GenreList genre={media.genre} size="sm" max={2} />
          ) : null}

          <View style={styles.statusRow}>
            <StatusBadge status={media.status} />
            <CardOverflowButton
              media={media}
              onOpenActions={onOpenActions}
              light
            />
          </View>
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

export default memo(MediaCardAtmospheric);

const styles = StyleSheet.create({
  pressable: {
    marginBottom: spacing.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },

  container: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  posterGlow: {
    padding: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },

  poster: {
    width: 86,
    aspectRatio: 2 / 3,
    borderRadius: 4,
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

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
