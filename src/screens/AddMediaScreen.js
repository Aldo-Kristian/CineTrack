import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import useMedia from '../hooks/useMedia';
import useTmdbSearch from '../hooks/useTmdbSearch';
import { useSnackbar } from '../hooks/useSnackbar';
import { mapTmdbSearchResult } from '../services/tmdbMapper';
import SearchBar from '../components/SearchBar';
import OfflineBanner from '../components/OfflineBanner';
import TmdbSearchResultItem from '../components/TmdbSearchResultItem';
import ConfirmAddSheet from '../components/ConfirmAddSheet';

const AddMediaScreen = ({ navigation }) => {
  const { items, isTmdbConfigured, previewTmdb, addFromTmdb } = useMedia();
  const { show } = useSnackbar();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const { status, results, errorCode, errorMessage } = useTmdbSearch(query);

  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const previewRequestRef = useRef(0);

  const inCollection = (result) => {
    const type = result.media_type === 'tv' ? 'SERIES' : 'MOVIE';
    return items.some(
      (item) => item.tmdb_id === result.id && item.type === type
    );
  };

  const openPreview = async (result) => {
    const requestId = previewRequestRef.current + 1;
    previewRequestRef.current = requestId;

    setSelected(result);
    setPreview(mapTmdbSearchResult(result));
    setDegraded(false);
    setPreviewError(null);
    setAddError(null);
    setIsPreviewing(true);

    try {
      const response = await previewTmdb(result);

      if (previewRequestRef.current !== requestId) {
        return;
      }

      setPreview(response.data);
      setDegraded(Boolean(response.degraded));
    } catch (error) {
      if (previewRequestRef.current === requestId) {
        setDegraded(true);
        setPreviewError(error?.message ?? null);
      }
    } finally {
      if (previewRequestRef.current === requestId) {
        setIsPreviewing(false);
      }
    }
  };

  const closePreview = () => {
    previewRequestRef.current += 1;
    setSelected(null);
    setPreview(null);
    setIsPreviewing(false);
    setAddError(null);
  };

  const handleAdd = async ({ status: addStatus, rating }) => {
    if (!selected) {
      return;
    }

    setIsAdding(true);
    setAddError(null);

    const result = await addFromTmdb(selected, {
      status: addStatus,
      rating,
    });

    setIsAdding(false);

    if (!result.ok) {
      setAddError(
        result.errors?.general ??
          Object.values(result.errors ?? {}).join('\n') ??
          'Cannot add this title.'
      );
      return;
    }

    closePreview();
    show({ message: 'Added to collection' });
    navigation.goBack();
  };

  const emptyMessage = () => {
    if (status === 'loading') {
      return <ActivityIndicator color={colors.primaryLight} />;
    }

    if (status === 'idle') {
      return (
        <Text style={styles.hint}>
          Type at least 2 characters to search TMDB.
        </Text>
      );
    }

    if (status === 'empty') {
      return (
        <Text style={styles.hint}>
          No results. Check the spelling or add it manually.
        </Text>
      );
    }

    if (status === 'offline') {
      return (
        <OfflineBanner message="Offline — you can still add manually." />
      );
    }

    if (status === 'error') {
      return (
        <OfflineBanner
          message={
            errorCode === 'AUTH'
              ? 'TMDB token is invalid. Online search is off; add manually instead.'
              : errorMessage ?? 'Online search failed. Add manually instead.'
          }
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={status === 'success' ? results : []}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: spacing['4xl'] + insets.bottom },
          ]}
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          renderItem={({ item }) => (
            <TmdbSearchResultItem
              result={item}
              inCollection={inCollection(item)}
              onPress={openPreview}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Find a movie or series</Text>
              <Text style={styles.subtitle}>
                Search once — poster, year, genres, synopsis, and streaming
                providers fill in automatically.
              </Text>

              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder={
                  isTmdbConfigured
                    ? 'Search movie or series...'
                    : 'Online search is off'
                }
                autoFocus={isTmdbConfigured}
                editable={isTmdbConfigured}
              />

              {!isTmdbConfigured ? (
                <OfflineBanner message="Online search is off. Add your title manually instead." />
              ) : null}

              <Pressable
                style={styles.manualLink}
                onPress={() => navigation.navigate('ManualAdd')}
                accessibilityRole="button"
                accessibilityLabel="Can't find it? Add manually"
              >
                <Plus size={16} color={colors.textSecondary} />
                <Text style={styles.manualText}>
                  Can’t find it? Add manually
                </Text>
              </Pressable>

              {status === 'success' ? (
                <Text style={styles.resultCount}>
                  {results.length} result{results.length === 1 ? '' : 's'}
                </Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>{emptyMessage()}</View>
          }
        />
      </KeyboardAvoidingView>

      {selected ? (
        <ConfirmAddSheet
          key={`${selected.media_type}-${selected.id}`}
          visible
          data={preview}
          isPreviewing={isPreviewing}
          degraded={degraded || Boolean(previewError)}
          isAdding={isAdding}
          error={addError}
          onClose={closePreview}
          onConfirm={handleAdd}
        />
      ) : null}
    </View>
  );
};

export default AddMediaScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
  },

  header: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  manualLink: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  manualText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textDecorationLine: 'underline',
  },

  resultCount: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  separator: {
    height: spacing.sm,
  },

  empty: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },

  hint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeight.sm,
  },
});
