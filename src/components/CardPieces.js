import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MoreVertical, Star } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

export const CardRating = ({ value, light = false }) => {
  if (value === null || value === undefined) {
    return null;
  }

  return (
    <View style={styles.rating}>
      <Star size={13} color={colors.warning} fill={colors.warning} />
      <Text style={[styles.ratingText, light && styles.lightText]}>
        {Number(value).toFixed(1)}
      </Text>
    </View>
  );
};

export const CardMeta = ({ typeLabel, year, light = false }) => (
  <Text style={[styles.meta, light && styles.lightText]} numberOfLines={1}>
    {[typeLabel, year].filter(Boolean).join(' · ')}
  </Text>
);

export const CardOverflowButton = ({ onOpenActions, media, light = false }) => {
  if (!onOpenActions) {
    return null;
  }

  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation?.();
        onOpenActions(media);
      }}
      style={styles.overflow}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={`Actions for ${media.title}`}
    >
      <MoreVertical
        size={20}
        color={light ? colors.text : colors.textSecondary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },

  lightText: {
    color: colors.text,
  },

  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  overflow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
});
