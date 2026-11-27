import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Database,
  ImageOff,
  Info,
  MapPin,
  Tv,
  Wand2,
} from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MAX_CONTENT_WIDTH } from '../constants/layout';
import { APP_VERSION } from '../constants/appInfo';
import useMedia from '../hooks/useMedia';
import { useSnackbar } from '../hooks/useSnackbar';
import RegionPicker from '../components/RegionPicker';
import SubscriptionPicker from '../components/SubscriptionPicker';
import BrandLogo from '../components/BrandLogo';

const hasUserDetails = (media) =>
  ['genre', 'release_year', 'description'].some((field) =>
    String(media?.[field] ?? '').trim()
  );

const SettingsRow = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  disabled = false,
  accessibilityLabel,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || !onPress}
    style={styles.row}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={accessibilityLabel ?? title}
  >
    <View style={styles.rowIcon}>{icon}</View>

    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>

    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    {onPress ? <ChevronRight size={18} color={colors.textMuted} /> : null}
  </Pressable>
);

const SettingsSection = ({ title, children }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const {
    items,
    region,
    subscriptions,
    setSubscriptions,
    changeRegion,
    isTmdbConfigured,
    enrichItems,
    applyMatch,
  } = useMedia();
  const { show } = useSnackbar();
  const insets = useSafeAreaInsets();

  const [regionVisible, setRegionVisible] = useState(false);
  const [regionBusy, setRegionBusy] = useState(false);
  const [subscriptionsVisible, setSubscriptionsVisible] = useState(false);
  const [enrich, setEnrich] = useState({
    status: 'idle',
    current: 0,
    total: 0,
    title: '',
    applied: 0,
    failed: 0,
    cancelled: false,
  });
  const [review, setReview] = useState([]);
  const abortRef = useRef(null);

  const missingTmdb = items.filter((item) => !item.tmdb_id).length;

  const handleRegion = async (code) => {
    setRegionVisible(false);
    setRegionBusy(true);

    try {
      const result = await changeRegion(code);

      if (!result.ok) {
        Alert.alert('Cannot change region', result.error);
        return;
      }

      show({
        message: `Region set to ${result.region}. Provider caches refreshed: ${result.updated}.`,
      });
    } catch (error) {
      Alert.alert(
        'Cannot change region',
        error?.message ?? 'Please try again.'
      );
    } finally {
      setRegionBusy(false);
    }
  };

  const handleSubscriptions = async (ids) => {
    setSubscriptionsVisible(false);

    try {
      await setSubscriptions(ids);
      show({ message: 'Subscriptions saved' });
    } catch (error) {
      Alert.alert(
        'Cannot save subscriptions',
        error?.message ?? 'Please try again.'
      );
    }
  };

  const startEnrichment = async () => {
    if (!isTmdbConfigured) {
      Alert.alert(
        'Online features are off',
        'Add EXPO_PUBLIC_TMDB_TOKEN to enable automatic matching.'
      );
      return;
    }

    if (missingTmdb === 0) {
      Alert.alert(
        'Already complete',
        'Every title in your collection already has a TMDB match.'
      );
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setReview([]);
    setEnrich({
      status: 'running',
      current: 0,
      total: missingTmdb,
      title: '',
      applied: 0,
      failed: 0,
      cancelled: false,
    });

    try {
      const result = await enrichItems({
        signal: controller.signal,
        onProgress: (progress) =>
          setEnrich((current) => ({
            ...current,
            current: progress.current,
            total: progress.total,
            title: progress.title ?? '',
          })),
      });

      setReview(result.review ?? []);
      setEnrich((current) => ({
        ...current,
        status: 'done',
        applied: result.applied ?? 0,
        failed: result.failed ?? 0,
        cancelled: Boolean(result.cancelled),
        title: '',
      }));

      if (result.cancelled) {
        show({ message: 'Enrichment cancelled' });
      } else {
        show({ message: `Enriched ${result.applied ?? 0} title(s)` });
      }
    } catch (error) {
      setEnrich((current) => ({ ...current, status: 'done' }));
      Alert.alert('Enrichment failed', error?.message ?? 'Please try again.');
    } finally {
      abortRef.current = null;
    }
  };

  const cancelEnrichment = () => {
    abortRef.current?.abort();
    setEnrich((current) => ({ ...current, status: 'cancelling' }));
  };

  const applyCandidate = async (media, candidate, overwrite) => {
    try {
      const result = await applyMatch(media, candidate, { overwrite });

      if (!result.ok) {
        Alert.alert(
          'Cannot apply match',
          Object.values(result.errors ?? {}).join('\n')
        );
        return;
      }

      setReview((current) =>
        current.filter((entry) => entry.media.id !== media.id)
      );
      show({ message: `Metadata updated for "${media.title}"` });
    } catch (error) {
      Alert.alert(
        'Cannot apply match',
        error?.message ?? 'Please try again.'
      );
    }
  };

  const promptApplyCandidate = (media, candidate) => {
    if (hasUserDetails(media)) {
      Alert.alert(
        'Replace existing details?',
        'Keep your current genre, year, and description, or replace them with TMDB data.',
        [
          {
            text: 'Keep existing',
            onPress: () => applyCandidate(media, candidate, false),
          },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => applyCandidate(media, candidate, true),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    applyCandidate(media, candidate, true);
  };

  const clearImageCache = () => {
    Alert.alert(
      'Clear image cache?',
      'Posters and provider logos will be downloaded again when needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await Image.clearDiskCache();
              await Image.clearMemoryCache();
              show({ message: 'Image cache cleared' });
            } catch {
              Alert.alert('Cannot clear cache', 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const percent =
    enrich.total > 0
      ? Math.min(100, Math.round((enrich.current / enrich.total) * 100))
      : 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing['4xl'] + insets.bottom },
        ]}
      >
        <SettingsSection title="Preferences">
          <SettingsRow
            icon={<MapPin size={20} color={colors.primaryLight} />}
            title="Region"
            subtitle={
              regionBusy
                ? 'Refreshing provider caches...'
                : 'Streaming availability country'
            }
            value={region}
            onPress={() => setRegionVisible(true)}
            disabled={regionBusy}
          />

          <SettingsRow
            icon={<Tv size={20} color={colors.primaryLight} />}
            title="My streaming subscriptions"
            subtitle="Prioritized on poster cards"
            value={
              subscriptions.length > 0
                ? `${subscriptions.length} selected`
                : 'None'
            }
            onPress={() => setSubscriptionsVisible(true)}
          />

          <SettingsRow
            icon={<Info size={20} color={colors.primaryLight} />}
            title="Online metadata"
            subtitle="TMDB token from EXPO_PUBLIC_TMDB_TOKEN"
            value={isTmdbConfigured ? 'On' : 'Off'}
          />
        </SettingsSection>

        <SettingsSection title="Collection tools">
          <SettingsRow
            icon={<Wand2 size={20} color={colors.primaryLight} />}
            title="Complete my existing titles automatically"
            subtitle={
              missingTmdb > 0
                ? `${missingTmdb} title(s) without a TMDB match`
                : 'All titles already matched'
            }
            onPress={startEnrichment}
            disabled={enrich.status === 'running' || enrich.status === 'cancelling'}
          />

          {enrich.status !== 'idle' ? (
            <View style={styles.progressBox}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {enrich.status === 'running'
                    ? `Working ${enrich.current}/${enrich.total}`
                    : enrich.status === 'cancelling'
                      ? 'Cancelling...'
                      : enrich.cancelled
                        ? 'Cancelled'
                        : 'Finished'}
                </Text>

                {enrich.status === 'running' ? (
                  <Pressable
                    onPress={cancelEnrichment}
                    style={styles.cancelButton}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel enrichment"
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>

              {enrich.title ? (
                <Text style={styles.progressTitle} numberOfLines={1}>
                  {enrich.title}
                </Text>
              ) : null}

              {enrich.status === 'done' ? (
                <Text style={styles.progressTitle}>
                  Applied: {enrich.applied} · Failed: {enrich.failed}
                </Text>
              ) : null}
            </View>
          ) : null}

          {review.length > 0 ? (
            <View style={styles.reviewBox}>
              <Text style={styles.reviewTitle}>
                Needs review ({review.length})
              </Text>
              <Text style={styles.reviewHelp}>
                These titles did not match exactly. Pick the correct one.
              </Text>

              {review.map((entry) => (
                <View key={entry.media.id} style={styles.reviewItem}>
                  <Text style={styles.reviewMedia} numberOfLines={1}>
                    {entry.media.title}
                    {entry.media.release_year
                      ? ` · ${entry.media.release_year}`
                      : ''}
                  </Text>

                  {entry.candidates.map((candidate) => (
                    <Pressable
                      key={`${candidate.media_type}-${candidate.id}`}
                      onPress={() =>
                        promptApplyCandidate(entry.media, candidate)
                      }
                      style={styles.candidate}
                      accessibilityRole="button"
                      accessibilityLabel={`Apply ${candidate.title ?? candidate.name}`}
                    >
                      <Text style={styles.candidateTitle} numberOfLines={1}>
                        {candidate.title ?? candidate.name}
                      </Text>
                      <Text style={styles.candidateMeta}>
                        {candidate.media_type === 'tv' ? 'Series' : 'Movie'}
                        {candidate.release_date || candidate.first_air_date
                          ? ` · ${String(
                              candidate.release_date ??
                                candidate.first_air_date
                            ).slice(0, 4)}`
                          : ''}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </SettingsSection>

        <SettingsSection title="Data">
          <SettingsRow
            icon={<Database size={20} color={colors.primaryLight} />}
            title="Backup & Restore"
            subtitle="Export or import a JSON backup (v2, v1 supported)"
            onPress={() => navigation.navigate('Backup')}
          />

          <SettingsRow
            icon={<ImageOff size={20} color={colors.primaryLight} />}
            title="Clear image cache"
            subtitle="Posters and provider logos"
            onPress={clearImageCache}
          />
        </SettingsSection>

        <SettingsSection title="About & Credits">
          <View style={styles.aboutBox}>
            <View style={styles.aboutBrand}>
              <BrandLogo variant="mark" size={48} />

              <View style={styles.aboutBrandText}>
                <Text style={styles.aboutName}>CineTrack</Text>
                <Text style={styles.aboutMuted}>Version {APP_VERSION}</Text>
              </View>
            </View>

            <Text style={styles.aboutText}>
              This product uses the TMDB API but is not endorsed or certified
              by TMDB.
            </Text>
            <Text style={styles.aboutText}>
              Streaming availability data provided by JustWatch.
            </Text>
            <Text style={styles.aboutMuted}>
              Offline-first collection tracker
            </Text>
          </View>
        </SettingsSection>
      </ScrollView>

      {regionVisible ? (
        <RegionPicker
          visible
          value={region}
          onClose={() => setRegionVisible(false)}
          onSelect={handleRegion}
        />
      ) : null}

      {subscriptionsVisible ? (
        <SubscriptionPicker
          visible
          value={subscriptions}
          region={region}
          onClose={() => setSubscriptionsVisible(false)}
          onSave={handleSubscriptions}
        />
      ) : null}
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },

  section: {
    gap: spacing.sm,
  },

  sectionTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  sectionBody: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },

  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  rowIcon: {
    width: 32,
    alignItems: 'center',
  },

  rowText: {
    flex: 1,
    gap: 2,
  },

  rowTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  rowSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },

  rowValue: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  progressBox: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  cancelButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  cancelText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceSecondary,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  progressTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  reviewBox: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  reviewTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  reviewHelp: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  reviewItem: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  reviewMedia: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  candidate: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.background,
  },

  candidateTitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  candidateMeta: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },

  aboutBox: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  aboutBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  aboutBrandText: {
    flex: 1,
    gap: 2,
  },

  aboutName: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  aboutText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  aboutMuted: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
});
