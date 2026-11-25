import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MEDIA_TYPES, MEDIA_STATUSES } from '../constants/mediaOptions';
import RatingInput from './RatingInput';
import GenrePicker from './GenrePicker';
import YearPicker from './YearPicker';

const FieldError = ({ message }) =>
  message ? <Text style={styles.errorText}>{message}</Text> : null;

const MediaForm = ({
  formData,
  onChange,
  onSubmit,
  errors = {},
  submitLabel = 'Save',
  isSubmitting = false,
}) => {
  const handleChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={formData.title}
          onChangeText={(value) => handleChange('title', value)}
          placeholder="Enter movie or series title"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          maxLength={150}
        />
        <FieldError message={errors.title} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Type *</Text>
        <View style={styles.options}>
          {MEDIA_TYPES.map((item) => (
            <Pressable
              key={item.value}
              style={[
                styles.option,
                formData.type === item.value && styles.selectedOption,
              ]}
              onPress={() => handleChange('type', item.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.type === item.value && styles.selectedOptionText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <FieldError message={errors.type} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Genre</Text>
        <GenrePicker
          value={formData.genre}
          onChange={(value) => handleChange('genre', value)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Release Year</Text>
        <YearPicker
          value={formData.release_year}
          onChange={(value) => handleChange('release_year', value)}
          hasError={Boolean(errors.release_year)}
        />
        <FieldError message={errors.release_year} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Viewing Status *</Text>
        <View style={styles.options}>
          {MEDIA_STATUSES.map((item) => (
            <Pressable
              key={item.value}
              style={[
                styles.option,
                formData.status === item.value && styles.selectedOption,
              ]}
              onPress={() => handleChange('status', item.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.status === item.value && styles.selectedOptionText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <FieldError message={errors.status} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Personal Rating</Text>
        <RatingInput
          value={formData.rating}
          onChange={(value) => handleChange('rating', value)}
        />
        <FieldError message={errors.rating} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
          placeholder="Write a short description..."
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
        />
      </View>

      <Pressable
        style={[
          styles.submitButton,
          isSubmitting && styles.disabledButton,
        ]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
};

export default MediaForm;

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },

  field: {
    gap: spacing.sm,
  },

  label: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },

  inputError: {
    borderColor: colors.danger,
  },

  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.xs,
  },

  textArea: {
    minHeight: 110,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.surface,
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

  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  submitButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabledButton: {
    opacity: 0.5,
  },
});