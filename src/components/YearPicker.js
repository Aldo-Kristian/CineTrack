import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  FlatList,
  Keyboard,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Check, X } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { getYearOptions } from '../constants/years';

const ITEM_HEIGHT = 52;
const PANEL_MAX_HEIGHT = 380;
const PANEL_MIN_HEIGHT = 240;
const GAP = 6;

const YearPicker = ({ value, onChange, hasError = false }) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const fieldRef = useRef(null);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const years = useMemo(() => getYearOptions(), []);

  // Ketik angka -> tahun yang diawali angka itu tampil dulu, lalu yang mengandungnya.
  const filteredYears = useMemo(() => {
    const keyword = query.trim();

    if (!keyword) {
      return years;
    }

    const startsWith = years.filter((year) => year.startsWith(keyword));
    const contains = years.filter(
      (year) => !year.startsWith(keyword) && year.includes(keyword)
    );

    return [...startsWith, ...contains];
  }, [years, query]);

  // Pantau keyboard supaya panel tidak tertutup.
  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return undefined;
    }

    const showSub = Keyboard.addListener('keyboardDidShow', (event) =>
      setKeyboardHeight(event.endCoordinates?.height ?? 0)
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardHeight(0)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  // Ukur posisi field di layar, lalu buka panel tepat di bawahnya.
  const open = () => {
    setQuery('');

    if (fieldRef.current?.measureInWindow) {
      fieldRef.current.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setVisible(true);
      });
    } else {
      setVisible(true);
    }
  };

  const close = () => setVisible(false);

  const selectYear = (year) => {
    onChange(year);
    close();
  };

  const clearYear = () => {
    onChange('');
    close();
  };

  // Hanya dipakai saat FlatList pertama kali muncul (query masih kosong).
  const initialIndex = Math.max(0, years.indexOf(String(value ?? '')));

  // Posisi panel: di bawah field, dibatasi agar tidak keluar layar / tertutup keyboard.
  const panelLeft = anchor.width ? anchor.x : spacing.lg;
  const panelWidth = anchor.width || windowWidth - spacing.lg * 2;
  const preferredTop = anchor.y + anchor.height + GAP;
  const available = windowHeight - keyboardHeight - preferredTop - GAP;
  const panelHeight = Math.min(
    PANEL_MAX_HEIGHT,
    Math.max(PANEL_MIN_HEIGHT, available)
  );
  const maxTop = windowHeight - keyboardHeight - panelHeight - GAP;
  const panelTop = Math.max(insets.top + GAP, Math.min(preferredTop, maxTop));

  return (
    <>
      <Pressable
        ref={fieldRef}
        collapsable={false}
        style={[styles.field, hasError && styles.fieldError]}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Choose release year"
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? String(value) : 'Select release year'}
        </Text>

        <ChevronDown size={20} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={close} />

          <View
            style={[
              styles.panel,
              {
                top: panelTop,
                left: panelLeft,
                width: panelWidth,
                height: panelHeight,
              },
            ]}
          >
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Release year</Text>

              <Pressable
                onPress={close}
                hitSlop={10}
                accessibilityLabel="Close"
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              value={query}
              onChangeText={(text) => setQuery(text.replace(/\D/g, ''))}
              placeholder="Type a year to filter..."
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              keyboardType="number-pad"
              maxLength={4}
            />

            <FlatList
              data={filteredYears}
              keyExtractor={(year) => year}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              initialScrollIndex={initialIndex}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item === String(value ?? '');

                return (
                  <Pressable
                    style={[styles.row, isSelected && styles.selectedRow]}
                    onPress={() => selectYear(item)}
                  >
                    <Text
                      style={[
                        styles.rowText,
                        isSelected && styles.selectedRowText,
                      ]}
                    >
                      {item}
                    </Text>

                    {isSelected ? (
                      <Check size={18} color={colors.primaryLight} />
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No matching year</Text>
              }
            />

            {value ? (
              <Pressable style={styles.clearButton} onPress={clearYear}>
                <Text style={styles.clearText}>Clear year</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default YearPicker;

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
  },

  fieldError: {
    borderColor: colors.danger,
  },

  value: {
    color: colors.text,
    fontSize: typography.fontSize.md,
  },

  placeholder: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },

  overlay: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  panel: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    elevation: 8,
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  panelTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },

  row: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },

  selectedRow: {
    backgroundColor: colors.primaryDark,
  },

  rowText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },

  selectedRowText: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing['2xl'],
  },

  clearButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  clearText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});