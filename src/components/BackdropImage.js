import React, { memo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { imageUrl } from '../services/tmdbClient';
import PosterPlaceholder from './PosterPlaceholder';

const BackdropImage = ({ media, style, transition = 200 }) => {
  const candidates = [
    imageUrl(media?.backdrop_path, 'w780'),
    imageUrl(media?.poster_path, 'w780'),
  ].filter(Boolean);
  const [failedSources, setFailedSources] = useState([]);
  const source = candidates.find((uri) => !failedSources.includes(uri));

  return (
    <View style={[styles.container, style]}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="disk"
          transition={transition}
          recyclingKey={source}
          onError={() =>
            setFailedSources((current) =>
              current.includes(source) ? current : [...current, source]
            )
          }
          accessibilityLabel={`${media?.title ?? 'Title'} backdrop`}
        />
      ) : (
        <PosterPlaceholder media={media} style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
};

export default memo(BackdropImage);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#1F1F1F',
  },
});
