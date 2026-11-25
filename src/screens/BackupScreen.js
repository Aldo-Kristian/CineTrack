import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Share,
  Alert,
  StyleSheet,
} from 'react-native';
import { Upload, Download } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import useMedia from '../hooks/useMedia';
import { buildBackup, parseBackup } from '../services/mediaService';

const BackupScreen = () => {
  const { items, importItems } = useMedia();
  const [text, setText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      await Share.share({
        title: 'CineTrack backup',
        message: buildBackup(items),
      });
    } catch (error) {
      Alert.alert('Export failed', error?.message ?? 'Unknown error.');
    }
  };

  const runImport = async () => {
    setIsImporting(true);
    const result = await importItems(text);
    setIsImporting(false);

    if (!result.ok) {
      Alert.alert('Import failed', result.error);
      return;
    }

    setText('');
    Alert.alert(
      'Import complete',
      `Imported: ${result.imported}\nSkipped (duplicates): ${result.duplicates}\nInvalid: ${result.invalid}`
    );
  };

  const handleImport = () => {
    const parsed = parseBackup(text);

    if (!parsed.ok) {
      Alert.alert('Invalid backup', parsed.error);
      return;
    }

    Alert.alert(
      'Import backup',
      `Found ${parsed.items.length} title(s). Your current data is kept and duplicates are skipped.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: runImport },
      ]
    );
  };

  const canExport = items.length > 0;
  const canImport = text.trim().length > 0 && !isImporting;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export</Text>
        <Text style={styles.description}>
          Share your collection ({items.length} titles) as JSON text. Send it to
          a notes app, cloud drive, or chat to keep a backup.
        </Text>

        <Pressable
          style={[styles.button, !canExport && styles.disabledButton]}
          onPress={handleExport}
          disabled={!canExport}
        >
          <Upload size={18} color={colors.text} />
          <Text style={styles.buttonText}>Share Backup</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Import</Text>
        <Text style={styles.description}>
          Paste a CineTrack backup below. Existing titles are kept; duplicates
          (same title, type, and year) are skipped.
        </Text>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Paste backup JSON here..."
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />

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
    paddingBottom: spacing['4xl'],
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

  input: {
    minHeight: 160,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.sm,
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

  buttonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabledButton: {
    opacity: 0.5,
  },
});