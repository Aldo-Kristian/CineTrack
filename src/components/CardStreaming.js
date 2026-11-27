import React from 'react';
import { View, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import spacing from '../constants/spacing';
import ProviderButton from './ProviderButton';
import ProviderLogos from './ProviderLogos';

const CardStreaming = ({ media, primary, secondary, accent, compact }) => {
  if (!primary) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ProviderButton
        provider={primary.provider}
        kind={primary.kind}
        media={media}
        tmdbLink={media.tmdb_link}
        accent={accent ?? colors.primary}
        compact={compact}
      />

      {secondary.length > 0 ? (
        <ProviderLogos
          providers={secondary}
          media={media}
          tmdbLink={media.tmdb_link}
        />
      ) : null}
    </View>
  );
};

export default CardStreaming;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
