import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { ImagePlus, Trash2 } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import PosterImage from './PosterImage';

const extensionFor = (asset) => {
  const name = asset?.fileName ?? asset?.uri ?? '';
  const match = String(name).match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = match?.[1]?.toLowerCase();
  return ext && ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext)
    ? ext
    : 'jpg';
};

const PosterPicker = ({ value, genre, title, onChange }) => {
  const [isPicking, setIsPicking] = useState(false);

  const pick = async () => {
    setIsPicking(true);

    try {
      // Sistem photo picker tidak memerlukan izin kamera; Expo ImagePicker
      // menangani akses galeri sesuai platform.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const destination = new File(
        Paths.document,
        `poster-${Date.now()}.${extensionFor(asset)}`
      );

      if (destination.exists) {
        destination.delete();
      }

      await new File(asset.uri).copy(destination);
      onChange(destination.uri);
    } catch (error) {
      Alert.alert(
        'Cannot use this image',
        error?.message ?? 'The selected image could not be copied.'
      );
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View style={styles.container}>
      {value ? (
        <PosterImage
          media={{ poster_uri: value, genre, title }}
          style={styles.preview}
          contentFit="cover"
        />
      ) : (
        <View style={styles.emptyPreview}>
          <ImagePlus size={28} color={colors.textMuted} />
          <Text style={styles.emptyText}>No custom poster</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={styles.button}
          onPress={pick}
          disabled={isPicking}
          accessibilityRole="button"
          accessibilityLabel="Choose poster from gallery"
        >
          <ImagePlus size={18} color={colors.text} />
          <Text style={styles.buttonText}>
            {isPicking
              ? 'Choosing...'
              : value
                ? 'Change poster'
                : 'Choose poster from gallery'}
          </Text>
        </Pressable>

        {value ? (
          <Pressable
            style={styles.remove}
            onPress={() => onChange('')}
            accessibilityRole="button"
            accessibilityLabel="Remove custom poster"
          >
            <Trash2 size={18} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default PosterPicker;

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },

  preview: {
    width: 108,
    aspectRatio: 2 / 3,
    borderRadius: 8,
  },

  emptyPreview: {
    width: 108,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },

  buttonText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  remove: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
});
