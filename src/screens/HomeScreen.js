import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MEDIA_STATUSES } from '../constants/mediaOptions';
import useMedia from '../hooks/useMedia';
import { getStatistics } from '../services/mediaService';
import { getStatusColor } from '../utils/formatters';
import MediaCard from '../components/MediaCard';
import PosterCarousel from '../components/PosterCarousel';
import EmptyState from '../components/EmptyState';
import FloatingAddButton from '../components/FloatingAddButton';

const COMPLETED_LIMIT = 5;

const Section = ({ title, count, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {typeof count === 'number' ? (
        <Text style={styles.sectionCount}>{count}</Text>
      ) : null}
    </View>
    {children}
  </View>
);

const HomeScreen = ({ navigation }) => {
  const { items, isLoading } = useMedia();
  const stats = useMemo(() => getStatistics(items), [items]);

  const watching = useMemo(
    () => items.filter((item) => item.status === 'WATCHING'),
    [items]
  );
  const upNext = useMemo(
    () => items.filter((item) => item.status === 'TO_WATCH'),
    [items]
  );
  const recentlyCompleted = useMemo(
    () =>
      items
        .filter((item) => item.status === 'COMPLETED')
        .slice(0, COMPLETED_LIMIT),
    [items]
  );

  const openDetails = (media) =>
    navigation.navigate('MediaDetails', { id: media.id });

  const openStatus = (status) =>
    navigation.navigate('Watchlist', { status });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text
              style={[
                styles.heading,
                { color: colors.primary, letterSpacing: 2 },
              ]}
            >
              CINETRACK
            </Text>
            <Text style={styles.subheading}>
              Your personal film & series tracker
            </Text>
          </View>

          <Pressable
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Settings size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          {MEDIA_STATUSES.map((item) => (
            <Pressable
              key={item.value}
              style={styles.summaryCard}
              onPress={() => openStatus(item.value)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${item.label} titles`}
            >
              <Text
                style={[
                  styles.summaryValue,
                  { color: getStatusColor(item.value) },
                ]}
              >
                {stats.byStatus[item.value]}
              </Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your collection is empty"
            message="Find a movie or series and CineTrack will fill in the poster, year, genres, and streaming providers."
            actionLabel="Find your first movie"
            onAction={() => navigation.navigate('AddMedia')}
          />
        ) : (
          <>
            {watching.length > 0 ? (
              <Section title="Continue Watching" count={watching.length}>
                <PosterCarousel data={watching} onPress={openDetails} />
              </Section>
            ) : null}

            {upNext.length > 0 ? (
              <Section title="Up Next" count={upNext.length}>
                <PosterCarousel data={upNext} onPress={openDetails} />
              </Section>
            ) : null}

            {recentlyCompleted.length > 0 ? (
              <Section title="Recently Completed">
                {recentlyCompleted.map((media) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    onPress={openDetails}
                  />
                ))}
              </Section>
            ) : null}

            {watching.length === 0 &&
            upNext.length === 0 &&
            recentlyCompleted.length === 0 ? (
              <Section title="Recent activity">
                {items.slice(0, 5).map((media) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    onPress={openDetails}
                  />
                ))}
              </Section>
            ) : null}
          </>
        )}
      </ScrollView>

      <FloatingAddButton onPress={() => navigation.navigate('AddMedia')} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },

  titleBlock: {
    flex: 1,
  },

  heading: {
    color: colors.text,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },

  subheading: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  summaryCard: {
    flex: 1,
    minHeight: 72,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  sectionCount: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  loader: {
    marginTop: spacing['2xl'],
  },
});
