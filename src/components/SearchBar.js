import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";

import colors from "../constants/colors";
import typography from "../constants/typography";
import spacing from "../constants/spacing";

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search movies or series...",
}) => {
  return (
    <View style={styles.container}>
      <Search size={20} color={colors.textMuted} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.lg,
    height: 52,
    gap: spacing.md,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    paddingVertical: 0,
  },
});

export default SearchBar;
