import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import useMedia from '../hooks/useMedia';
import { filterMedia, sortMedia } from '../services/mediaService';
import { confirmDeleteMedia } from '../utils/alerts';
import SearchBar from '../components/SearchBar';
import FilterTabs from '../components/FilterTabs';
import StatusFilter from '../components/StatusFilter';
import SortSelector from '../components/SortSelector';
import MediaCard from '../components/MediaCard';
import EmptyState from '../components/EmptyState';
import FloatingAddButton from '../components/FloatingAddButton';

const WatchlistScreen = ({ navigation }) => {
  const { items, isLoading, remove } = useMedia();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECENT');

  const visibleItems = useMemo(
    () => sortMedia(filterMedia(items, { query, type, status }), sortBy),
    [items, query, type, status, sortBy]
  );

  const openDetails = (media) =>
    navigation.navigate('MediaDetails', { id: media.id });

  const openActions = (media) => {
    Alert.alert(media.title, 'Choose an action', [
      {
        text: 'Edit',
        onPress: () => navigation.navigate('EditMedia', { id: media.id }),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => confirmDeleteMedia(media, remove),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const isCollectionEmpty = items.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Watchlist</Text>

        <SearchBar value={query} onChangeText={setQuery} />
        <FilterTabs selectedType={type} onSelect={setType} />
        <StatusFilter selectedStatus={status} onSelect={setStatus} />
        <SortSelector selectedSort={sortBy} onSelect={setSortBy} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MediaCard
              media={item}
              onPress={openDetails}
              onLongPress={openActions}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            visibleItems.length === 0 && styles.listContentEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            isCollectionEmpty ? (
              <EmptyState />
            ) : (
              <EmptyState
                title="No results"
                message="Try a different keyword or filter."
              />
            )
          }
        />
      )}

      <FloatingAddButton onPress={() => navigation.navigate('AddMedia')} />
    </SafeAreaView>
  );
};

export default WatchlistScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  heading: {
    color: colors.text,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  loader: {
    marginTop: spacing['3xl'],
  },
});