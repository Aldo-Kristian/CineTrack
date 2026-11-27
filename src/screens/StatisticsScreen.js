import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MAX_CONTENT_WIDTH } from '../constants/layout';
import { MEDIA_TYPES, MEDIA_STATUSES } from '../constants/mediaOptions';
import useMedia from '../hooks/useMedia';
import { getStatistics } from '../services/mediaService';
import { getStatusColor } from '../utils/formatters';

const BarRow = ({ label, count, total, color }) => {
  const percent = total > 0 ? (count / total) * 100 : 0;

  return (
    <View style={styles.barRow}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barCount}>{count}</Text>
      </View>

      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const StatisticsScreen = () => {
  const { items } = useMedia();
  const stats = useMemo(() => getStatistics(items), [items]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Statistics</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>Total titles</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.averageRow}>
              <Star size={18} color={colors.warning} fill={colors.warning} />
              <Text style={styles.summaryValue}>
                {stats.averageRating === null
                  ? '-'
                  : stats.averageRating.toFixed(1)}
              </Text>
            </View>
            <Text style={styles.summaryLabel}>
              Average rating ({stats.ratedCount} rated)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Status</Text>
          {MEDIA_STATUSES.map((item) => (
            <BarRow
              key={item.value}
              label={item.label}
              count={stats.byStatus[item.value]}
              total={stats.total}
              color={getStatusColor(item.value)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Type</Text>
          {MEDIA_TYPES.map((item) => (
            <BarRow
              key={item.value}
              label={item.label}
              count={stats.byType[item.value]}
              total={stats.total}
              color={colors.primary}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatisticsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },

  heading: {
    color: colors.text,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.lg,
  },

  averageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  summaryValue: {
    color: colors.text,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },

  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.lg,
    gap: spacing.lg,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  barRow: {
    gap: spacing.sm,
  },

  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  barLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  barCount: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});