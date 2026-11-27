import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { SHEET_SEARCH_HEIGHT_RATIO } from '../constants/layout';
import useMedia from '../hooks/useMedia';
import useTmdbSearch from '../hooks/useTmdbSearch';
import BottomSheet from './BottomSheet';
import SearchBar from './SearchBar';
import OfflineBanner from './OfflineBanner';
import TmdbSearchResultItem from './TmdbSearchResultItem';

// Dipakai di layar Edit untuk mencari poster + metadata pengganti.
const TmdbSearchSheet = ({ visible, onClose, onSelect }) => {
  const { isTmdbConfigured } = useMedia();
  const [query, setQuery] = useState('');
  const { status, results, errorMessage } = useTmdbSearch(query);

  const renderEmpty = () => {
    if (status === 'loading') {
      return <ActivityIndicator color={colors.primaryLight} />;
    }

    if (status === 'idle') {
      return (
        <Text style={styles.hint}>Type at least 2 characters.</Text>
      );
    }

    if (status === 'empty') {
      return <Text style={styles.hint}>No results. Try another title.</Text>;
    }

    if (status === 'offline' || status === 'error') {
      return <Text style={styles.error}>{errorMessage}</Text>;
    }

    return null;
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={null}
      showClose={false}
      showHandle={false}
      scrollable={false}
      heightRatio={SHEET_SEARCH_HEIGHT_RATIO}
      bodyStyle={styles.body}
      headerContent={
        <View style={styles.searchRow}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search movie or series..."
            autoFocus
            style={styles.searchBar}
          />

          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
      }
    >
      {!isTmdbConfigured ? (
        <OfflineBanner message="Online search is off. Add poster manually instead." />
      ) : null}

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={status === 'success' ? results : []}
        keyExtractor={(item) => `${item.media_type}-${item.id}`}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TmdbSearchResultItem
            result={item}
            compact
            onPress={(selected) => {
              onSelect(selected);
              onClose();
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
      />
    </BottomSheet>
  );
};

export default TmdbSearchSheet;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.md,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  searchBar: {
    flex: 1,
  },

  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },

  separator: {
    height: spacing.xs,
  },

  hint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },

  error: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
