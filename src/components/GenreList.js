import React from 'react';
import { View, StyleSheet } from 'react-native';

import spacing from '../constants/spacing';
import { parseGenres } from '../constants/genres';
import GenreChip from './GenreChip';

// Menampilkan kotak-kotak genre berwarna dari string 'Action, Drama'.
// max: batasi jumlah kotak; sisanya ditampilkan sebagai '+N'.
const GenreList = ({ genre, size = 'sm', max, justify = 'flex-start' }) => {
  const genres = parseGenres(genre);

  if (genres.length === 0) {
    return null;
  }

  const visible = max ? genres.slice(0, max) : genres;
  const hiddenCount = genres.length - visible.length;

  return (
    <View style={[styles.list, { justifyContent: justify }]}>
      {visible.map((item) => (
        <GenreChip key={item} label={item} size={size} />
      ))}

      {hiddenCount > 0 ? (
        <GenreChip label={`+${hiddenCount}`} size={size} />
      ) : null}
    </View>
  );
};

export default GenreList;

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
    gap: spacing.xs + 2,
  },
});