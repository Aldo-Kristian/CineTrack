import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, Download, FolderOpen, FileText, X } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import useMedia from '../hooks/useMedia';
import { buildBackup, parseBackup } from '../services/mediaService';

// Membaca file hasil pilihan picker. fetch() bisa membaca URI file:// maupun
// content:// di Android tanpa masalah izin; File.text() jadi cadangan.
const readPickedFile = async (uri) => {
  try {
    const response = await fetch(uri);
    return await response.text();
  } catch {
    return new File(uri).text();
  }
};
const BackupScreen = () => {
  const { items, importItems } = useMedia();
  const insets = useSafeAreaInsets();

  // picked: { name, text, count } setelah file backup dipilih & valid.
  const [picked, setPicked] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // ---------------------------- Export (file .json) ----------------------------
  const handleExport = async () => {
    setIsExporting(true);

    try {
      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert('Export failed', 'Sharing is not available on this device.');
        return;
      }

      const stamp = new Date().toISOString().slice(0, 10);
      const file = new File(Paths.cache, `cinetrack-backup-${stamp}.json`);

      if (file.exists) {
        file.delete();
      }

      file.create();
      file.write(buildBackup(items));

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Save CineTrack backup',
        UTI: 'public.json',
      });
    } catch (error) {
      Alert.alert('Export failed', error?.message ?? 'Unknown error.');
    } finally {
      setIsExporting(false);
    }
  };

  // ---------------------------- Import (pilih file .json) ----------------------------
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const content = await readPickedFile(asset.uri);
      const parsed = parseBackup(content);

      if (!parsed.ok) {
        setPicked(null);
        Alert.alert('Invalid backup file', parsed.error);
        return;
      }

      setPicked({
        name: asset.name ?? 'backup.json',
        text: content,
        count: parsed.items.length,
      });
    } catch (error) {
      Alert.alert('Cannot read file', error?.message ?? 'Unknown error.');
    }
  };

  const runImport = async () => {
    if (!picked) {
      return;
    }

    setIsImporting(true);
    const result = await importItems(picked.text);
    setIsImporting(false);

    if (!result.ok) {
      Alert.alert('Import failed', result.error);
      return;
    }

    setPicked(null);
    Alert.alert(
      'Import complete',
      `Imported: ${result.imported}\nSkipped (duplicates): ${result.duplicates}\nInvalid: ${result.invalid}`
    );
  };

  const handleImport = () => {
    if (!picked) {
      return;
    }

    Alert.alert(
      'Import backup',
      `Found ${picked.count} title(s) in "${picked.name}". Your current data is kept and duplicates are skipped.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: runImport },
      ]
    );
  };

  const canExport = items.length > 0 && !isExporting;
  const canImport = Boolean(picked) && !isImporting;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: spacing['4xl'] + insets.bottom },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export</Text>
        <Text style={styles.description}>
          Save your collection ({items.length} titles) as a .json file. Send it
          to cloud drive, Files, or chat to keep a backup.
        </Text>

        <Pressable
          style={[styles.button, !canExport && styles.disabledButton]}
          onPress={handleExport}
          disabled={!canExport}
        >
          <Upload size={18} color={colors.text} />
          <Text style={styles.buttonText}>
            {isExporting ? 'Preparing...' : 'Export Backup File'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Import</Text>
        <Text style={styles.description}>
          Choose a CineTrack backup (.json) file. Existing titles are kept;
          duplicates (same title, type, and year) are skipped.
        </Text>

        <Pressable style={styles.secondaryButton} onPress={handlePickFile}>
          <FolderOpen size={18} color={colors.text} />
          <Text style={styles.buttonText}>Choose Backup File</Text>
        </Pressable>

        {picked ? (
          <View style={styles.fileBox}>
            <FileText size={22} color={colors.primaryLight} />

            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {picked.name}
              </Text>
              <Text style={styles.fileMeta}>{picked.count} title(s) found</Text>
            </View>

            <Pressable
              onPress={() => setPicked(null)}
              hitSlop={10}
              accessibilityLabel="Remove selected file"
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={[styles.button, !canImport && styles.disabledButton]}
          onPress={handleImport}
          disabled={!canImport}
        >
          <Download size={18} color={colors.text} />
          <Text style={styles.buttonText}>
            {isImporting ? 'Importing...' : 'Import Backup'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default BackupScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.lg,
    gap: spacing.md,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.md,
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  fileMeta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.md,
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: spacing.md,
  },

  buttonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabledButton: {
    opacity: 0.5,
  },
});