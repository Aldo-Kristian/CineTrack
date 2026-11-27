import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import typography from '../constants/typography';
import { getGenreTheme } from '../constants/genreThemes';
import GenreIcon from './GenreIcon';

const initialsFor = (title) =>
  String(title ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('') || '?';

// Placeholder bertema genre; dipakai saat poster tidak tersedia.
const PosterPlaceholder = ({ media, style, iconSize = 30 }) => {
  const theme = getGenreTheme(media?.genre);

  return (
    <LinearGradient
      colors={theme.gradient}
      style={[styles.container, style]}
      accessibilityLabel={`${media?.title ?? 'Title'} poster placeholder`}
    >
      <View style={[styles.iconWrap, { borderColor: `${theme.accent}80` }]}>
        <GenreIcon name={theme.icon} size={iconSize} color={theme.accent} />
      </View>

      <Text style={[styles.initials, { color: theme.accent }]}>
        {initialsFor(media?.title)}
      </Text>
    </LinearGradient>
  );
};

export default PosterPlaceholder;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },

  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },

  initials: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 2,
  },
});
