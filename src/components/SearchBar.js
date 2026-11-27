import React from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Search, X } from "lucide-react-native";

import colors from "../constants/colors";
import typography from "../constants/typography";
import spacing from "../constants/spacing";

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search movies or series...",
  autoFocus = false,
  editable = true,
  onSubmitEditing,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
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
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel="Search"
      />

      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
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
    borderRadius: 8,
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
