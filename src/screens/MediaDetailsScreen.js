import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Pencil, Trash2 } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MAX_CONTENT_WIDTH } from '../constants/layout';
import useMedia from '../hooks/useMedia';
import { useSnackbar } from '../hooks/useSnackbar';
import { mediaToFormData } from '../services/validationService';
import {
  parseProviders,
  hasProviders,
  formatUpdatedAgo,
  isStale,
} from '../services/providerService';
import {
  shouldRefreshProviders,
} from '../services/mediaService';
import { formatMediaType, formatRating, formatDate } from '../utils/formatters';
import BackdropImage from '../components/BackdropImage';
import PosterImage from '../components/PosterImage';
import GenreList from '../components/GenreList';
import StatusBadge from '../components/StatusBadge';
import StatusSegmented from '../components/StatusSegmented';
import ProviderSection from '../components/ProviderSection';
import CollapsibleText from '../components/CollapsibleText';
import RatingSheet from '../components/RatingSheet';
import EmptyState from '../components/EmptyState';

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const MediaDetailsScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const {
    items,
    edit,
    remove,
    restore,
    region,
    isTmdbConfigured,
    refreshProviders,
  } = useMedia();
  const { show } = useSnackbar();
  const insets = useSafeAreaInsets();
  const media = useMemo(() => items.find((item) => item.id === id), [items, id]);

  const didAutoRefresh = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);

  useEffect(() => {
    if (
      didAutoRefresh.current ||
      !isTmdbConfigured ||
      !media?.tmdb_id ||
      !shouldRefreshProviders(media, region)
    ) {
      return;
    }

    didAutoRefresh.current = true;
    refreshProviders(media).catch(() => {});
  }, [isTmdbConfigured, media, refreshProviders, region]);

  if (!media) {
    return (
      <View style={styles.center}>
        <EmptyState title="Not found" message="This item no longer exists." />
      </View>
    );
  }

  const providers = parseProviders(media.providers_json);
  const available = hasProviders(providers);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await refreshProviders(media);
    setIsRefreshing(false);

    if (!result.ok) {
      Alert.alert('Cannot refresh', result.error ?? 'Please try again.');
    }
  };

  const handleChangeStatus = async (status) => {
    if (status === media.status) {
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
      setRatingVisible(true);
    }
  };

  const saveRating = async (rating) => {
    setIsSavingRating(true);
    const result = await edit(media.id, {
      ...mediaToFormData(media),
      rating,
    });
    setIsSavingRating(false);

    if (!result.ok) {
      Alert.alert('Cannot save rating', Object.values(result.errors).join('\n'));
      return;
    }

    setRatingVisible(false);
    show({ message: 'Rating saved' });
  };

  const handleDelete = () => {
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

            navigation.goBack();
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

  const hasRating = media.rating !== null && media.rating !== undefined;
  const stale = isStale(media.providers_fetched_at);
  const hasBackdrop = Boolean(media.backdrop_path);
  const hasPoster = Boolean(media.poster_path || media.poster_uri);
  const heroHeight = hasBackdrop ? 200 : hasPoster ? 160 : 120;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing['4xl'] + insets.bottom },
        ]}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          <BackdropImage media={media} style={styles.backdrop} />

          <LinearGradient
            colors={['transparent', 'rgba(20,20,20,0.4)', colors.background]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.heroBody}>
          <PosterImage media={media} style={styles.poster} />

          <View style={styles.heroText}>
            <Text style={styles.title}>{media.title}</Text>
            <Text style={styles.meta}>
              {formatMediaType(media.type)}
              {media.release_year ? ` · ${media.release_year}` : ''}
            </Text>

            {media.genre ? (
              <GenreList genre={media.genre} size="sm" max={3} />
            ) : null}

            <StatusBadge status={media.status} />
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Pressable
            style={styles.ratingButton}
            onPress={() => setRatingVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Change personal rating"
          >
            <Star
              size={24}
              color={hasRating ? colors.warning : colors.textMuted}
              fill={hasRating ? colors.warning : 'transparent'}
            />
            <View>
              <Text style={styles.ratingLabel}>Personal rating</Text>
              <Text style={styles.ratingValue}>{formatRating(media.rating)}</Text>
            </View>
          </Pressable>

          <Text style={styles.ratingHint}>Tap to rate</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <StatusSegmented
            value={media.status}
            onChange={handleChangeStatus}
          />
        </View>

        <View style={styles.providerWrap}>
          <ProviderSection
            providers={providers}
            media={media}
            region={media.providers_region || region}
            fetchedAt={media.providers_fetched_at}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            isConfigured={isTmdbConfigured}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <CollapsibleText text={media.description} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <InfoRow label="Type" value={formatMediaType(media.type)} />
          <InfoRow
            label="Release year"
            value={media.release_year ?? '-'}
          />
          <InfoRow label="Added" value={formatDate(media.created_at)} />
          <InfoRow label="Last updated" value={formatDate(media.updated_at)} />
          {media.tmdb_id ? (
            <InfoRow label="TMDB id" value={media.tmdb_id} />
          ) : null}
          <InfoRow
            label="Streaming info"
            value={available ? formatUpdatedAgo(media.providers_fetched_at) : 'Not cached'}
          />
          {available && stale ? (
            <Text style={styles.staleHint}>
              This cache is older than 7 days. Refresh to see current
              availability.
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditMedia', { id: media.id })}
            accessibilityRole="button"
            accessibilityLabel="Edit title"
          >
            <Pencil size={18} color={colors.text} />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete title"
          >
            <Trash2 size={18} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>
              Delete
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {ratingVisible ? (
        <RatingSheet
          visible
          media={media}
          isSaving={isSavingRating}
          onClose={() => setRatingVisible(false)}
          onSave={saveRating}
        />
      ) : null}
    </View>
  );
};

export default MediaDetailsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingBottom: spacing['4xl'],
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
  },

  hero: {
    backgroundColor: colors.surface,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  heroBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: -72,
  },

  poster: {
    width: 116,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  heroText: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },

  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  ratingButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  ratingLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },

  ratingValue: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 2,
  },

  ratingHint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.lg,
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },

  providerWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },

  infoLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  infoValue: {
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
  },

  staleHint: {
    color: colors.warning,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },

  actionButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },

  editButton: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },

  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: colors.danger,
  },

  actionText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
