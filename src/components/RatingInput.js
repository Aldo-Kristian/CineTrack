import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Star, Minus, Plus, X } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { RATING_MIN, RATING_MAX, RATING_STEP } from '../constants/mediaOptions';

const RatingInput = ({ value = null, onChange }) => {
  const decreaseRating = () => {
    if (value === null) {
      return;
    }

    onChange(Math.max(RATING_MIN, value - RATING_STEP));
  };

  const increaseRating = () => {
    const nextValue =
      value === null
        ? RATING_MIN
        : Math.min(RATING_MAX, value + RATING_STEP);

    onChange(nextValue);
  };

  const clearRating = () => onChange(null);

  return (
    <View style={styles.container}>
      <View style={styles.ratingInfo}>
        <Star size={22} color={colors.warning} />
        <View>
          <Text style={styles.label}>Your Rating</Text>
          <Text style={styles.value}>
            {value === null ? 'Not rated' : `${Number(value).toFixed(1)} / ${RATING_MAX}`}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={clearRating}
          disabled={value === null}
          style={[styles.button, value === null && styles.disabledButton]}
          accessibilityLabel="Clear rating"
        >
          <X size={18} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={decreaseRating}
          disabled={value === null || value <= RATING_MIN}
          style={[
            styles.button,
            (value === null || value <= RATING_MIN) && styles.disabledButton,
          ]}
          accessibilityLabel="Decrease rating"
        >
          <Minus size={18} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={increaseRating}
          disabled={value !== null && value >= RATING_MAX}
          style={[
            styles.button,
            value !== null && value >= RATING_MAX && styles.disabledButton,
          ]}
          accessibilityLabel="Increase rating"
        >
          <Plus size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.lg,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  value: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.4,
  },
});

export default RatingInput;