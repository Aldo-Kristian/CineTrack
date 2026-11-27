import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [config, setConfig] = useState(null);
  const [visible, setVisible] = useState(false);
  const [translateY] = useState(() => new Animated.Value(80));
  const timerRef = useRef(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.timing(translateY, {
      toValue: 80,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false);
      }
    });
  }, [translateY]);

  const show = useCallback(
    ({ message, actionLabel, onAction, duration = 5000 }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setConfig({ message, actionLabel, onAction });
      setVisible(true);
      translateY.setValue(80);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(hide, duration);
    },
    [hide, translateY]
  );

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <SnackbarContext.Provider value={value}>
      <View style={styles.root}>
        {children}

        {visible && config ? (
          <Animated.View
            style={[
              styles.container,
              {
                bottom: 80 + insets.bottom,
                transform: [{ translateY }],
              },
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.snackbar}>
              <Text style={styles.message} numberOfLines={2}>
                {config.message}
              </Text>

              {config.actionLabel ? (
                <Pressable
                  onPress={() => {
                    const handler = config.onAction;
                    hide();
                    handler?.();
                  }}
                  hitSlop={8}
                  style={styles.action}
                  accessibilityRole="button"
                  accessibilityLabel={config.actionLabel}
                >
                  <Text style={styles.actionText}>{config.actionLabel}</Text>
                </Pressable>
              ) : null}
            </View>
          </Animated.View>
        ) : null}
      </View>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar must be used inside <SnackbarProvider>.');
  }

  return context;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },

  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 8,
  },

  message: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.sm,
  },

  action: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },

  actionText: {
    color: colors.primaryLight,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
