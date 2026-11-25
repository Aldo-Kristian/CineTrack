import React, { useRef, useState } from 'react';
import { ScrollView, Alert, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import spacing from '../constants/spacing';
import useMedia from '../hooks/useMedia';
import { EMPTY_FORM } from '../services/validationService';
import MediaForm from '../components/MediaForm';

const AddMediaScreen = ({ navigation }) => {
  const { add } = useMedia();
  const scrollRef = useRef(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const result = await add(formData);
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
        submitLabel="Add to Collection"
        isSubmitting={isSubmitting}
      />
    </ScrollView>
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
    paddingBottom: spacing['4xl'],
  },
});