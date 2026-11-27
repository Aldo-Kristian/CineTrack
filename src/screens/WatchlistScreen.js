import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Circle,
  Check,
  Pencil,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { FAB_BOTTOM_PADDING, MAX_CONTENT_WIDTH } from '../constants/layout';
import { MEDIA_STATUSES } from '../constants/mediaOptions';
import useMedia from '../hooks/useMedia';
import { useSnackbar } from '../hooks/useSnackbar';
import { filterMedia, sortMedia } from '../services/mediaService';
import { mediaToFormData } from '../services/validationService';
import SearchBar from '../components/SearchBar';
import ActiveFilterChips from '../components/ActiveFilterChips';
import FilterSheet from '../components/FilterSheet';
import ActionSheet from '../components/ActionSheet';
import RatingSheet from '../components/RatingSheet';
import MediaCard from '../components/MediaCard';
import EmptyState from '../components/EmptyState';
import FloatingAddButton from '../components/FloatingAddButton';

const DEFAULT_FILTERS = {
  type: 'ALL',
  status: 'ALL',
  genre: 'ALL',
  sortBy: 'RECENT',
};

const countActiveFilters = (filters) =>
  [
    filters.type !== 'ALL',
    filters.status !== 'ALL',
    filters.genre !== 'ALL',
    filters.sortBy !== 'RECENT',
  ].filter(Boolean).length;

const WatchlistScreen = ({ navigation, route }) => {
  const { items, isLoading, remove, restore, edit } = useMedia();
  const { show } = useSnackbar();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [actions, setActions] = useState({ media: null, mode: 'main' });
  const [ratingMedia, setRatingMedia] = useState(null);
  const [isSavingRating, setIsSavingRating] = useState(false);

  // Ringkasan Home mengirim status lewat params; terapkan sekali lalu bersihkan.
  useFocusEffect(
    useCallback(() => {
      const next = route.params?.status;

      if (
        next &&
        ['TO_WATCH', 'WATCHING', 'COMPLETED'].includes(next)
      ) {
        setFilters((current) => ({ ...current, status: next }));
        navigation.setParams({ status: undefined });
      }
    }, [navigation, route.params?.status])
  );

  const visibleItems = useMemo(
    () => sortMedia(filterMedia(items, filters), filters.sortBy),
    [items, filters]
  );

  const openDetails = (media) =>
    navigation.navigate('MediaDetails', { id: media.id });

  const openActions = (media) => setActions({ media, mode: 'main' });

  const handleStatus = async (media, status) => {
    if (media.status === status) {
      return;
    }

    const result = await edit(media.id, {
      ...mediaToFormData(media),
      status,
    });

    if (!result.ok) {
      Alert.alert('Cannot update', Object.values(result.errors).join('\n'));
      return;
    }

    if (status === 'COMPLETED') {
      setRatingMedia({ ...media, status });
    }
  };

  const confirmDelete = (media) => {
    Alert.alert(
      'Delete this title?',
      `"${media.title}" will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await remove(media.id);

            if (!result.ok) {
              Alert.alert('Cannot delete', 'Please try again.');
              return;
            }

            show({
              message: `Deleted "${media.title}"`,
              actionLabel: 'Undo',
              duration: 5000,
              onAction: () => restore(result.media),
            });
          },
        },
      ]
    );
  };

  const saveRating = async (rating) => {
    if (!ratingMedia) {
      return;
    }

    setIsSavingRating(true);
    const result = await edit(ratingMedia.id, {
      ...mediaToFormData(ratingMedia),
      rating,
    });
    setIsSavingRating(false);

    if (!result.ok) {
      Alert.alert('Cannot save rating', Object.values(result.errors).join('\n'));
      return;
    }

    setRatingMedia(null);
    show({ message: 'Rating saved' });
  };

  const actionOptions =
    actions.mode === 'status' && actions.media
      ? MEDIA_STATUSES.map((item) => ({
          key: item.value,
          label:
            actions.media.status === item.value
              ? `${item.label} (current)`
              : `Set ${item.label}`,
          icon:
            actions.media.status === item.value ? (
              <Check size={18} color={colors.success} />
            ) : (
              <Circle size={18} color={colors.textMuted} />
            ),
          onPress: () => handleStatus(actions.media, item.value),
        }))
      : actions.media
        ? [
            {
              key: 'status',
              label: 'Change status',
              icon: <RefreshCw size={18} color={colors.textSecondary} />,
              hasSubmenu: true,
              onPress: () =>
                setActions({ media: actions.media, mode: 'status' }),
            },
            {
              key: 'edit',
              label: 'Edit',
              icon: <Pencil size={18} color={colors.textSecondary} />,
              onPress: () =>
                navigation.navigate('EditMedia', { id: actions.media.id }),
            },
            {
              key: 'delete',
              label: 'Delete',
              icon: <Trash2 size={18} color={colors.danger} />,
              destructive: true,
              onPress: () => confirmDelete(actions.media),
            },
          ]
        : [];

  const activeCount = countActiveFilters(filters);
  const emptyCollection = items.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.heading}>Watchlist</Text>
          <Text style={styles.count}>
            {visibleItems.length} {visibleItems.length === 1 ? 'title' : 'titles'}
          </Text>
        </View>

        <View style={styles.searchRow}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            style={styles.searchBar}
          />

          <Pressable
            style={styles.filterButton}
            onPress={() => setFilterVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Open filters, ${activeCount} active`}
          >
            <SlidersHorizontal size={20} color={colors.text} />
            {activeCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <ActiveFilterChips
          filters={filters}
          onRemove={(kind) =>
            setFilters((current) => ({
              ...current,
              [kind]: kind === 'sortBy' ? 'RECENT' : 'ALL',
            }))
          }
        />
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
              onOpenActions={openActions}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: FAB_BOTTOM_PADDING + insets.bottom },
            visibleItems.length === 0 && styles.listContentEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          initialNumToRender={8}
          windowSize={9}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={
            emptyCollection ? (
              <EmptyState
                title="Your watchlist is empty"
                message="Search TMDB or add a title manually to get started."
                actionLabel="Find your first movie"
                onAction={() => navigation.navigate('AddMedia')}
              />
            ) : (
              <EmptyState
                title="No results"
                message="Try a different keyword or filter."
              />
            )
          }
        />
      )}
      </KeyboardAvoidingView>

      <FloatingAddButton onPress={() => navigation.navigate('AddMedia')} />

      {filterVisible ? (
        <FilterSheet
          visible
          filters={filters}
          onClose={() => setFilterVisible(false)}
          onApply={(next) => {
            setFilters(next);
            setFilterVisible(false);
          }}
        />
      ) : null}

      {actions.media ? (
        <ActionSheet
          visible
          title={
            actions.mode === 'status'
              ? `Status · ${actions.media.title}`
              : actions.media.title
          }
          options={actionOptions}
          onClose={() => setActions({ media: null, mode: 'main' })}
        />
      ) : null}

      {ratingMedia ? (
        <RatingSheet
          visible
          media={ratingMedia}
          isSaving={isSavingRating}
          onClose={() => setRatingMedia(null)}
          onSave={saveRating}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default WatchlistScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  header: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  heading: {
    color: colors.text,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },

  count: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  searchBar: {
    flex: 1,
  },

  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },

  listContent: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  loader: {
    marginTop: spacing['3xl'],
  },
});
