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
import EmptyState from '../components/EmptyState';
import FloatingAddButton from '../components/FloatingAddButton';

const RECENT_LIMIT = 5;

const HomeScreen = ({ navigation }) => {
  const { items, isLoading } = useMedia();
  const stats = useMemo(() => getStatistics(items), [items]);
  const recentItems = items.slice(0, RECENT_LIMIT);

  const openDetails = (media) =>
    navigation.navigate('MediaDetails', { id: media.id });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={[styles.heading, { color: colors.primary, letterSpacing: 2 }]}>CINETRACK</Text>
            <Text style={styles.subheading}>
              Your personal film & series tracker
            </Text>
          </View>

          <Pressable
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Backup')}
            accessibilityRole="button"
            accessibilityLabel="Backup and restore"
          >
            <Settings size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          {MEDIA_STATUSES.map((item) => (
            <View key={item.value} style={styles.summaryCard}>
              <Text
                style={[
                  styles.summaryValue,
                  { color: getStatusColor(item.value) },
                ]}
              >
                {stats.byStatus[item.value]}
              </Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recently Updated</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : recentItems.length === 0 ? (
          <EmptyState />
        ) : (
          recentItems.map((media) => (
            <MediaCard key={media.id} media={media} onPress={openDetails} />
          ))
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
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },

  loader: {
    marginTop: spacing['2xl'],
  },
});