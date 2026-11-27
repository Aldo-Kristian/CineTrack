import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

// Bottom sheet sederhana memakai Modal bawaan React Native.
const ModalSheet = ({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
  maxHeightRatio = 0.86,
  showClose = true,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.scrollContent}>{children}</View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close bottom sheet"
          />

          <View
            style={[
              styles.sheet,
              {
                maxHeight: height * maxHeightRatio,
                paddingBottom: spacing.lg + insets.bottom,
              },
            ]}
          >
            <View style={styles.handle} />

            {title || showClose ? (
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>

                {showClose ? (
                  <Pressable
                    onPress={onClose}
                    hitSlop={12}
                    style={styles.closeButton}
                    accessibilityLabel="Close"
                  >
                    <X size={22} color={colors.textSecondary} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {content}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ModalSheet;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },

  title: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
