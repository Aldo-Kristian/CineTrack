import React, { memo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { imageUrl } from '../services/tmdbClient';
import PosterPlaceholder from './PosterPlaceholder';

// Prioritas sumber: poster lokal pilihan user -> poster TMDB -> placeholder tema.
// Jika salah satu sumber gagal dimuat, coba sumber berikutnya.
const PosterImage = ({
  media,
  style,
  size = 'w342',
  contentFit = 'cover',
  recyclingKey,
  transition = 150,
}) => {
  const remoteUri = imageUrl(media?.poster_path, size);
  const candidates = [media?.poster_uri, remoteUri].filter(Boolean);
  const [failedSources, setFailedSources] = useState([]);
  const source = candidates.find((uri) => !failedSources.includes(uri));

  return (
    <View style={[styles.container, style]}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          cachePolicy="disk"
          transition={transition}
          recyclingKey={recyclingKey ?? source}
          onError={() =>
            setFailedSources((current) =>
              current.includes(source) ? current : [...current, source]
            )
          }
          accessibilityLabel={`${media?.title ?? 'Title'} poster`}
        />
      ) : (
        <PosterPlaceholder media={media} style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
};

export default memo(PosterImage);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#1F1F1F',
  },
});
