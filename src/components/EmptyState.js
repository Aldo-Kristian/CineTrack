import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Film } from "lucide-react-native";

import colors from "../constants/colors";
import typography from "../constants/typography";
import spacing from "../constants/spacing";

const EmptyState = ({
  title = "Nothing here yet",
  message = "Your collection is empty. Add your first movie or series.",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Film size={36} color={colors.primaryLight} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing["4xl"],
  },

  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  message: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    textAlign: "center",
  },
});

export default EmptyState;
