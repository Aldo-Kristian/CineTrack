import React from 'react';
import { Image } from 'expo-image';

// Logo resmi CineTrack. `size` adalah tinggi logo (dp); `width` (jika diisi)
// mengalahkan size dan tinggi dihitung dari aspect ratio asli.
const LOGOS = {
  mark: {
    source: require('../../assets/images/logo-mark.png'),
    aspectRatio: 1,
  },
  wordmark: {
    source: require('../../assets/images/logo-wordmark.png'),
    aspectRatio: 1600 / 480,
  },
};

const BrandLogo = ({ variant = 'mark', size, width, style }) => {
  const logo = LOGOS[variant] ?? LOGOS.mark;
  const defaultHeight = variant === 'wordmark' ? 36 : 40;
  const height = size ?? defaultHeight;
  const resolvedWidth = width ?? height * logo.aspectRatio;
  const resolvedHeight = resolvedWidth / logo.aspectRatio;

  return (
    <Image
      source={logo.source}
      style={[
        { width: resolvedWidth, height: resolvedHeight },
        style,
      ]}
      contentFit="contain"
      accessibilityLabel="CineTrack logo"
      accessibilityRole="image"
    />
  );
};

export default BrandLogo;
