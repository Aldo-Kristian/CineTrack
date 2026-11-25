import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Pencil, Trash2 } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MEDIA_STATUSES } from '../constants/mediaOptions';
import useMedia from '../hooks/useMedia';
import { mediaToFormData } from '../services/validationService';
import { formatMediaType, formatRating, formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import GenreList from '../components/GenreList';
import EmptyState from '../components/EmptyState';

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const MediaDetailsScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const { items, edit, remove } = useMedia();
  const insets = useSafeAreaInsets();
  const media = useMemo(() => items.find((item) => item.id === id), [items, id]);

  if (!media) {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Not found"
          message="This item no longer exists."
        />
      </View>
    );
  }

  const handleChangeStatus = async (status) => {
    if (status === media.status) {
      return;
    }

    const result = await edit(media.id, { ...mediaToFormData(media), status });

    if (!result.ok) {
      Alert.alert('Cannot update', Object.values(result.errors).join('\n'));
    }
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
            navigation.goBack();
            await remove(media.id);
          },
        },
      ]
    );
  };

  const hasRating = media.rating !== null && media.rating !== undefined;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: spacing['4xl'] + insets.bottom }]}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{media.title}</Text>
        <StatusBadge status={media.status} />
      </View>

      <View style={styles.ratingBox}>
        <Star
          size={22}
          color={hasRating ? colors.warning : colors.textMuted}
          fill={hasRating ? colors.warning : 'none'}
        />
        <Text style={styles.ratingText}>{formatRating(media.rating)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusOptions}>
          {MEDIA_STATUSES.map((item) => {
            const isSelected = media.status === item.value;

            return (
              <Pressable
                key={item.value}
                style={[styles.option, isSelected && styles.selectedOption]}
                onPress={() => handleChangeStatus(item.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <InfoRow label="Type" value={formatMediaType(media.type)} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Genre</Text>
          {media.genre ? (
            <GenreList genre={media.genre} size="md" justify="flex-end" />
          ) : (
            <Text style={styles.infoValue}>-</Text>
          )}
        </View>
        <InfoRow label="Release year" value={media.release_year ?? '-'} />
        <InfoRow label="Added" value={formatDate(media.created_at)} />
        <InfoRow label="Last updated" value={formatDate(media.updated_at)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {media.description || 'No description.'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditMedia', { id: media.id })}
        >
          <Pencil size={18} color={colors.text} />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Trash2 size={18} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>
            Delete
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default MediaDetailsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
  },

  titleBlock: {
    gap: spacing.md,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },

  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.lg,
  },

  ratingText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.lg,
    gap: spacing.md,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },

  selectedOption: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },

  optionText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  selectedOptionText: {
    color: colors.text,
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

  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 6,
    paddingVertical: spacing.md,
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