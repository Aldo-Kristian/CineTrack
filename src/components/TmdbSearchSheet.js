import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import useMedia from '../hooks/useMedia';
import useTmdbSearch from '../hooks/useTmdbSearch';
import ModalSheet from './ModalSheet';
import SearchBar from './SearchBar';
import OfflineBanner from './OfflineBanner';
import TmdbSearchResultItem from './TmdbSearchResultItem';

// Dipakai di layar Edit untuk mencari poster + metadata pengganti.
const TmdbSearchSheet = ({ visible, onClose, onSelect }) => {
  const { isTmdbConfigured } = useMedia();
  const [query, setQuery] = useState('');
  const { status, results, errorMessage } = useTmdbSearch(query);

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Find poster & info">
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search movie or series..."
        autoFocus
      />

      {!isTmdbConfigured ? (
        <OfflineBanner message="Online search is off. Add poster manually instead." />
      ) : null}

      {status === 'loading' ? (
        <ActivityIndicator color={colors.primaryLight} style={styles.loader} />
      ) : null}

      {status === 'idle' ? (
        <Text style={styles.hint}>Type at least 2 characters.</Text>
      ) : null}

      {status === 'empty' ? (
        <Text style={styles.hint}>No results. Try another title.</Text>
      ) : null}

      {status === 'offline' || status === 'error' ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : null}

      <View style={styles.results}>
        {results.slice(0, 12).map((result) => (
          <TmdbSearchResultItem
            key={`${result.media_type}-${result.id}`}
            result={result}
            onPress={(item) => {
              onSelect(item);
              onClose();
            }}
          />
        ))}
      </View>
    </ModalSheet>
  );
};

export default TmdbSearchSheet;

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.lg,
  },

  hint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },

  error: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
  },

  results: {
    gap: spacing.sm,
  },
});
