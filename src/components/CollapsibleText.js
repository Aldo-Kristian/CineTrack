import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

const CollapsibleText = ({
  text,
  collapsedLines = 4,
  alwaysShowToggleAfter = 220,
}) => {
  const [expanded, setExpanded] = useState(false);
  const value = String(text ?? '').trim();

  if (!value) {
    return (
      <Text style={styles.text}>No description.</Text>
    );
  }

  const showToggle = value.length > alwaysShowToggleAfter;

  return (
    <View style={styles.container}>
      <Text
        style={styles.text}
        numberOfLines={expanded ? undefined : collapsedLines}
      >
        {value}
      </Text>

      {showToggle ? (
        <Pressable
          onPress={() => setExpanded((current) => !current)}
          style={styles.toggle}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less' : 'Read more'}
        >
          <Text style={styles.toggleText}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default CollapsibleText;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },

  text: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  toggle: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },

  toggleText: {
    color: colors.primaryLight,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
