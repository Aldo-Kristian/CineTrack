import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Star, StarHalf, X } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MIN_TOUCH_SIZE } from '../constants/layout';
import { RATING_MAX, RATING_MIN } from '../constants/mediaOptions';

const STAR_SIZE = 30;

const RatingInput = ({ value = null, onChange }) => {
  const clearRating = () => onChange(null);

  const handleStarPress = (index, event) => {
    const isHalf = event.nativeEvent.locationX < MIN_TOUCH_SIZE / 2;
    // Rating minimum proyek adalah 1.0; tap kiri bintang pertama tetap 1.0.
    const nextValue = Math.max(
      RATING_MIN,
      index + (isHalf ? 0.5 : 1)
    );
    onChange(nextValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.label}>Your Rating</Text>
          <Text style={styles.value}>
            {value === null
              ? 'Not rated'
              : `${Number(value).toFixed(1)} / ${RATING_MAX}`}
          </Text>
        </View>

        <Pressable
          onPress={clearRating}
          disabled={value === null}
          style={[styles.clearButton, value === null && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel="Clear rating"
        >
          <X size={16} color={colors.textSecondary} />
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.stars}>
        {[0, 1, 2, 3, 4].map((index) => {
          const starValue = index + 1;
          const isFull = value !== null && value >= starValue;
          const isHalf =
            value !== null && !isFull && value >= starValue - 0.5;

          return (
            <Pressable
              key={starValue}
              onPress={(event) => handleStarPress(index, event)}
              style={styles.starButton}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${starValue} stars`}
              accessibilityValue={{
                min: 1,
                max: RATING_MAX,
                now: value ?? 0,
                text:
                  value === null
                    ? 'Not rated'
                    : `${Number(value).toFixed(1)} of ${RATING_MAX}`,
              }}
            >
              {isFull ? (
                <Star
                  size={STAR_SIZE}
                  color={colors.warning}
                  fill={colors.warning}
                />
              ) : isHalf ? (
                <StarHalf
                  size={STAR_SIZE}
                  color={colors.warning}
                  fill={colors.warning}
                />
              ) : (
                <Star size={STAR_SIZE} color={colors.textMuted} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  info: {
    flex: 1,
    gap: 2,
  },

  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },

  value: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  clearButton: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
  },

  clearText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },

  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  starButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabled: {
    opacity: 0.4,
  },
});

export default RatingInput;
