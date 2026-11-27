import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { ExternalLink, Play } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { openProvider } from '../utils/links';

const ProviderButton = ({
  provider,
  kind = 'stream',
  media,
  tmdbLink,
  accent = colors.primary,
  compact = false,
}) => {
  const isPurchase = kind === 'rent' || kind === 'buy';
  const label = `${isPurchase ? 'Rent/Buy' : 'Open'} on ${
    provider?.provider_name ?? 'platform'
  }`;

  return (
    <Pressable
      onPress={() => openProvider(provider, media, tmdbLink)}
      style={[
        styles.button,
        compact && styles.buttonCompact,
        isPurchase && styles.secondary,
        !isPurchase && { backgroundColor: accent, borderColor: accent },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isPurchase ? (
        <ExternalLink size={16} color={colors.text} />
      ) : (
        <Play size={16} color={colors.background} fill={colors.background} />
      )}

      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          isPurchase && { color: colors.text },
          !isPurchase && { color: colors.background },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default ProviderButton;

const styles = StyleSheet.create({
  button: {
    maxWidth: '100%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  buttonCompact: {
    minHeight: 44,
    paddingVertical: 6,
  },

  secondary: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
  },

  label: {
    flexShrink: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },

  labelCompact: {
    fontSize: typography.fontSize.xs,
  },
});
