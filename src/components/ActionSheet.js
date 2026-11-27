import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import ModalSheet from './ModalSheet';

const ActionSheet = ({ visible, title, message, options = [], onClose }) => (
  <ModalSheet
    visible={visible}
    onClose={onClose}
    title={title}
    scrollable={false}
  >
    {message ? <Text style={styles.message}>{message}</Text> : null}

    <View style={styles.options}>
      {options.map((option) => (
        <Pressable
          key={option.key ?? option.label}
          onPress={() => {
            onClose?.();
            option.onPress?.();
          }}
          style={styles.option}
          accessibilityRole="button"
          accessibilityLabel={option.label}
        >
          {option.icon ?? null}

          <Text
            style={[
              styles.label,
              option.destructive && { color: colors.danger },
            ]}
          >
            {option.label}
          </Text>

          {option.hasSubmenu ? (
            <ChevronRight size={18} color={colors.textMuted} />
          ) : null}
        </Pressable>
      ))}
    </View>
  </ModalSheet>
);

export default ActionSheet;

const styles = StyleSheet.create({
  message: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  options: {
    gap: spacing.xs,
  },

  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },

  label: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },
});
