import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import {
  MAX_CONTENT_WIDTH,
  SHEET_MAX_HEIGHT_RATIO,
  SHEET_MIN_HEIGHT,
  SHEET_TOP_GAP,
} from '../constants/layout';
import useKeyboardHeight from '../hooks/useKeyboardHeight';

const BottomSheetFrame = ({
  visible,
  onClose,
  title,
  headerContent,
  footer,
  children,
  scrollable = true,
  showClose = true,
  showHandle = true,
  maxHeightRatio = SHEET_MAX_HEIGHT_RATIO,
  heightRatio,
  contentContainerStyle,
  bodyStyle,
}) => {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { height: windowHeight } = useWindowDimensions();
  const [translateY] = useState(() => new Animated.Value(48));

  useEffect(() => {
    if (!visible) {
      return;
    }

    translateY.setValue(48);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  const availableHeight = Math.max(
    SHEET_MIN_HEIGHT,
    windowHeight - keyboardHeight - insets.top - SHEET_TOP_GAP
  );
  const maxHeight = Math.min(
    windowHeight * maxHeightRatio,
    availableHeight
  );
  const fixedHeight = heightRatio
    ? Math.min(
        availableHeight,
        Math.max(SHEET_MIN_HEIGHT, windowHeight * heightRatio)
      )
    : undefined;
  const bottomPadding =
    keyboardHeight > 0 ? spacing.md : insets.bottom + spacing.md;

  return (
    <View
      style={[
        styles.overlay,
        { paddingBottom: keyboardHeight },
      ]}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="Close bottom sheet"
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            maxHeight,
            height: fixedHeight,
            paddingBottom: bottomPadding,
            transform: [{ translateY }],
          },
        ]}
      >
        {showHandle ? <View style={styles.handle} /> : null}

        {title || showClose ? (
          <View style={styles.header}>
            <Text
              style={styles.title}
              numberOfLines={2}
              maxFontSizeMultiplier={1.3}
            >
              {title}
            </Text>

            {showClose ? (
              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={22} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {headerContent ? (
          <View style={styles.headerContent}>{headerContent}</View>
        ) : null}

        {scrollable ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.body, bodyStyle]}>{children}</View>
        )}

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </Animated.View>
    </View>
  );
};

const BottomSheet = (props) => {
  const rootInsets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const fallbackMetrics = {
    frame: { x: 0, y: 0, width, height },
    insets: rootInsets,
  };

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onClose}
    >
      <SafeAreaProvider
        style={styles.flex}
        initialMetrics={initialWindowMetrics ?? fallbackMetrics}
      >
        <BottomSheetFrame {...props} />
      </SafeAreaProvider>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },

  sheet: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
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

  headerContent: {
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

  scroll: {
    flexShrink: 1,
  },

  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },

  body: {
    flexShrink: 1,
    minHeight: 0,
  },

  footer: {
    flexShrink: 0,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
});
