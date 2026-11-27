import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import useMedia from '../hooks/useMedia';
import { useSnackbar } from '../hooks/useSnackbar';
import { mediaToFormData } from '../services/validationService';
import { mergeMappedIntoForm } from '../services/mediaService';
import { deleteLocalFile } from '../utils/files';
import MediaForm from '../components/MediaForm';
import EmptyState from '../components/EmptyState';
import TmdbSearchSheet from '../components/TmdbSearchSheet';

const hasUserDetails = (form) =>
  ['genre', 'release_year', 'description'].some((field) =>
    String(form?.[field] ?? '').trim()
  );

const EditMediaScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const { items, edit, previewTmdb } = useMedia();
  const { show } = useSnackbar();
  const insets = useSafeAreaInsets();
  const media = useMemo(() => items.find((item) => item.id === id), [items, id]);

  const initialForm = useMemo(
    () => (media ? mediaToFormData(media) : null),
    [media]
  );

  const scrollRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isFinding, setIsFinding] = useState(false);

  const formData = draft ?? initialForm;

  // Hapus error hanya pada field yang baru diubah.
  const handleChange = (next) => {
    setErrors((previous) => {
      const remaining = {};
      Object.keys(previous).forEach((key) => {
        if (next[key] === formData[key]) {
          remaining[key] = previous[key];
        }
      });
      return remaining;
    });
    setDraft(next);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await edit(id, formData);
    setIsSubmitting(false);

    if (!result.ok) {
      const { general, ...fieldErrors } = result.errors;
      setErrors(fieldErrors);

      if (general) {
        Alert.alert('Cannot save', general);
      } else {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
      return;
    }

    if (media?.poster_uri && media.poster_uri !== formData.poster_uri) {
      deleteLocalFile(media.poster_uri);
    }

    show({ message: 'Changes saved' });
    navigation.goBack();
  };

  const applyTmdbResult = async (result) => {
    setIsFinding(true);

    try {
      const preview = await previewTmdb(result);
      const mapped = preview.data;

      const apply = (overwrite) => {
        const next = mergeMappedIntoForm(formData, mapped, overwrite);
        setDraft(next);
      };

      if (hasUserDetails(formData)) {
        Alert.alert(
          'Replace existing details?',
          'Keep your current genre, year, and description, or replace them with TMDB data.',
          [
            {
              text: 'Keep existing',
              onPress: () => apply(false),
            },
            {
              text: 'Replace',
              style: 'destructive',
              onPress: () => apply(true),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        apply(true);
      }
    } catch (error) {
      Alert.alert(
        'Cannot load info',
        error?.message ?? 'TMDB details could not be loaded.'
      );
    } finally {
      setIsFinding(false);
    }
  };

  if (!media || formData === null) {
    return (
      <View style={styles.center}>
        <EmptyState title="Not found" message="This item no longer exists." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing['4xl'] + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={[styles.findButton, isFinding && styles.disabled]}
          onPress={() => setSearchVisible(true)}
          disabled={isFinding}
          accessibilityRole="button"
          accessibilityLabel="Find poster and info automatically"
        >
          <Sparkles size={18} color={colors.primaryLight} />
          <View style={styles.findText}>
            <Text style={styles.findTitle}>
              Find poster & info automatically
            </Text>
            <Text style={styles.findSubtitle}>
              Search TMDB and fill missing metadata
            </Text>
          </View>
        </Pressable>

        <MediaForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          errors={errors}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
          defaultExpanded
        />
      </ScrollView>

      {searchVisible ? (
        <TmdbSearchSheet
          visible
          onClose={() => setSearchVisible(false)}
          onSelect={applyTmdbResult}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
};

export default EditMediaScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
  },

  findButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    backgroundColor: colors.surface,
  },

  findText: {
    flex: 1,
    gap: 2,
  },

  findTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  findSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  disabled: {
    opacity: 0.6,
  },
});
