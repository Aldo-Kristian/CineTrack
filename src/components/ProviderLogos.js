import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { openProvider } from '../utils/links';
import ProviderLogo from './ProviderLogo';

const ProviderLogos = ({ providers = [], media, tmdbLink }) => {
  if (!providers.length) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>Also on</Text>

      {providers.map((provider) => (
        <Pressable
          key={`${provider.provider_id}-${provider.kind ?? 'stream'}`}
          onPress={() => openProvider(provider, media, tmdbLink)}
          hitSlop={5}
          style={styles.logoButton}
          accessibilityRole="button"
          accessibilityLabel={`Open on ${provider.provider_name}`}
        >
          <ProviderLogo provider={provider} size={30} />
        </Pressable>
      ))}
    </View>
  );
};

export default ProviderLogos;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },

  prefix: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  logoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
