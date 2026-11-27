import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import spacing from '../constants/spacing';
import { MAX_CONTENT_WIDTH } from '../constants/layout';
import useKeyboardHeight from '../hooks/useKeyboardHeight';

// Pembungkus form: keyboard-aware di Android edge-to-edge & iOS, dengan
// konten yang dibatasi lebarnya dan padding bawah untuk field terakhir.
const ScreenContainer = ({
  children,
  scrollViewRef,
  contentContainerStyle,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  return (
    <KeyboardAvoidingView style={[styles.flex, style]} behavior="padding">
      <ScrollView
        ref={scrollViewRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + spacing['4xl'] + keyboardHeight,
          },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ScreenContainer;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    flexGrow: 1,
  },
});
