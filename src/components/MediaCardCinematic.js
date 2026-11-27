import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import StatusBadge from './StatusBadge';
import GenreList from './GenreList';
import BackdropImage from './BackdropImage';
import CardStreaming from './CardStreaming';
import { CardMeta, CardOverflowButton, CardRating } from './CardPieces';

const MediaCardCinematic = ({
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
      { borderColor: `${theme.accent}70`, borderTopColor: theme.accent },
    ]}
    accessibilityRole="button"
    accessibilityLabel={`${media.title}, ${card.typeLabel}${
      card.year ? ` ${card.year}` : ''
    }`}
  >
    <BackdropImage media={media} style={styles.backdrop} />

    <LinearGradient
      colors={['rgba(20,20,20,0.08)', 'rgba(20,20,20,0.72)', colors.background]}
      locations={[0, 0.55, 1]}
      style={StyleSheet.absoluteFill}
    />

    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {media.title}
        </Text>
        <CardRating value={media.rating} light />
        <CardOverflowButton
          media={media}
          onOpenActions={onOpenActions}
          light
        />
      </View>

      <CardMeta typeLabel={card.typeLabel} year={card.year} light />

      {card.genres.length > 0 ? (
        <View style={styles.genres}>
          <GenreList genre={media.genre} size="sm" max={2} />
        </View>
      ) : null}

      <View style={styles.footer}>
        <StatusBadge status={media.status} />
        <CardStreaming
          media={media}
          primary={card.primary}
          secondary={card.secondary}
          accent={theme.accent}
          compact
        />
      </View>
    </View>
  </Pressable>
);

export default memo(MediaCardCinematic);

const styles = StyleSheet.create({
  container: {
    minHeight: 238,
    marginBottom: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderTopWidth: 3,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    padding: spacing.lg,
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
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  genres: {
    marginVertical: spacing.xs,
  },

  footer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
});
