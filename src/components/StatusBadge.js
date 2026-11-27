import React from "react";
import { View, Text, StyleSheet } from "react-native";

import colors from "../constants/colors";
import typography from "../constants/typography";
import spacing from "../constants/spacing";

const STATUS_CONFIG = {
  TO_WATCH: {
    label: "To Watch",
    color: colors.status.toWatch,
  },
  WATCHING: {
    label: "Watching",
    color: colors.status.watching,
  },
  COMPLETED: {
    label: "Completed",
    color: colors.status.completed,
  },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: "Unknown",
    color: colors.textMuted,
  };

  return (
    <View
      style={[
        styles.container,
        { borderColor: config.color },
      ]}
    >
      <Text
        style={[styles.text, { color: config.color }]}
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },

  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});

export default StatusBadge;
