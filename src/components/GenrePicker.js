import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import {
  GENRES,
  parseGenres,
  serializeGenres,
} from '../constants/genres';
import GenreChip from './GenreChip';
import GenreList from './GenreList';

const SLIDE_DISTANCE = Dimensions.get('screen').height;

const GenrePicker = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Animated.Value disimpan di state (bukan ref) supaya aman dibaca saat render
  // dan tidak melanggar aturan React Compiler tentang akses ref.
  const [translateY] = useState(() => new Animated.Value(SLIDE_DISTANCE));
  const isClosing = useRef(false);

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SLIDE_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const selected = parseGenres(value);

  // Genre lama di luar daftar tetap ditampilkan agar bisa dilepas.
  const knownValues = GENRES.map((item) => item.value);
  const options = [
    ...knownValues,
    ...selected.filter((item) => !knownValues.includes(item)),
  ];

  const toggleGenre = (genre) => {
    const next = selected.includes(genre)
      ? selected.filter((item) => item !== genre)
      : [...selected, genre];

    onChange(serializeGenres(next));
  };

  const clearAll = () => onChange('');

  const open = () => {
    isClosing.current = false;
    translateY.setValue(SLIDE_DISTANCE);
    setVisible(true);
  };

  // Slide ke bawah dulu, baru Modal dilepas.
  const close = () => {
    if (isClosing.current) {
      return;
    }

    isClosing.current = true;

    Animated.timing(translateY, {
      toValue: SLIDE_DISTANCE,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  // Animasi masuk setiap kali Modal tampil.
  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.timing(translateY, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  // Geser handle / judul ke bawah untuk menutup sheet.
  // (Drag-to-dismiss tidak dipakai agar animasi tetap sederhana & stabil.)

  return (
    <>
      <Pressable
        style={styles.field}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Choose genres"
      >
        <View style={styles.fieldContent}>
          {selected.length > 0 ? (
            <GenreList genre={value} size="md" />
          ) : (
            <Text style={styles.placeholder}>Choose genres</Text>
          )}
        </View>

        <ChevronDown size={20} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.overlay}>
          {/* Tap area gelap di luar sheet = tutup */}
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={close}
              accessibilityLabel="Close genre picker"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              {
                maxHeight: height * 0.75,
                paddingBottom: spacing.lg + insets.bottom,
                transform: [{ translateY }],
              },
            ]}
          >
            {/* Area handle + judul */}
            <View style={styles.dragZone}>
              <View style={styles.handle} />

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select genres</Text>
                <Text style={styles.sheetCount}>
                  {selected.length} selected
                </Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.board}
              showsVerticalScrollIndicator={false}
            >
              {options.map((genre) => (
                <GenreChip
                  key={genre}
                  label={genre}
                  size="md"
                  selected={selected.includes(genre)}
                  onPress={() => toggleGenre(genre)}
                />
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                style={[
                  styles.clearButton,
                  selected.length === 0 && styles.disabledButton,
                ]}
                onPress={clearAll}
                disabled={selected.length === 0}
              >
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>

              <Pressable style={styles.doneButton} onPress={close}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

export default GenrePicker;

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },

  fieldContent: {
    flex: 1,
  },

  placeholder: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },

  dragZone: {
    gap: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },

  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },

  sheetTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  sheetCount: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  clearButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },

  clearText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  doneButton: {
    flex: 2,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
  },

  doneText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabledButton: {
    opacity: 0.4,
  },
});