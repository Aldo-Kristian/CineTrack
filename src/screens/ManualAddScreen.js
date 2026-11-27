import React, { useRef, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import useMedia from '../hooks/useMedia';
import { useSnackbar } from '../hooks/useSnackbar';
import { EMPTY_FORM } from '../services/validationService';
import MediaForm from '../components/MediaForm';
import ScreenContainer from '../components/ScreenContainer';

const ManualAddScreen = ({ navigation }) => {
  const { add } = useMedia();
  const { show } = useSnackbar();
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

  const handleFieldFocus = (field) => {
    if (field === 'description') {
      // Tunggu keyboard mulai terbuka agar scrollEnd menghitung viewport baru.
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 250);
    } else {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
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

    show({ message: 'Added to collection' });
    navigation.goBack();
  };

  return (
    <ScreenContainer scrollViewRef={scrollRef} style={styles.screen}>
      <MediaForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        errors={errors}
        submitLabel="Add to Collection"
        isSubmitting={isSubmitting}
        defaultExpanded={false}
        onFieldFocus={handleFieldFocus}
      />
    </ScreenContainer>
  );
};

export default ManualAddScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
