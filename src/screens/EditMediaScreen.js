import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import spacing from '../constants/spacing';
import useMedia from '../hooks/useMedia';
import { mediaToFormData } from '../services/validationService';
import MediaForm from '../components/MediaForm';
import EmptyState from '../components/EmptyState';

const EditMediaScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const { items, edit } = useMedia();
  const media = useMemo(() => items.find((item) => item.id === id), [items, id]);

  const scrollRef = useRef(null);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Isi form sekali saja saat data pertama kali tersedia.
  useEffect(() => {
    if (media && formData === null) {
      setFormData(mediaToFormData(media));
    }
  }, [media, formData]);

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
    setFormData(next);
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

    navigation.goBack();
  };

  if (!media || formData === null) {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Not found"
          message="This item no longer exists."
        />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <MediaForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        errors={errors}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
      />
    </ScrollView>
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
    paddingBottom: spacing['4xl'],
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
  },
});