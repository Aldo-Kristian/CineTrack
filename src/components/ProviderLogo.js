import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Tv } from 'lucide-react-native';

import colors from '../constants/colors';
import { imageUrl } from '../services/tmdbClient';

const ProviderLogoView = ({ provider, size = 32, borderColor = colors.border }) => {
  const src = imageUrl(provider?.logo_path, 'w92');

  return (
    <View
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
        },
      ]}
    >
      {src ? (
        <Image
          source={src}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="disk"
          recyclingKey={src}
          accessibilityLabel={provider?.provider_name}
        />
      ) : (
        <Tv size={size * 0.5} color={colors.textSecondary} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
  },
});

export default ProviderLogoView;
