import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { RefreshCw } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { formatUpdatedAgo, hasProviders } from '../services/providerService';
import { openExternalLink } from '../utils/links';
import ProviderLogo from './ProviderLogo';
import ProviderButton from './ProviderButton';

const GROUPS = [
  { key: 'stream', label: 'Stream' },
  { key: 'free', label: 'Free & Ads' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
];

const ProviderRow = ({ provider, media, tmdbLink }) => (
  <View style={styles.providerRow}>
    <ProviderLogo provider={provider} size={36} />
    <Text style={styles.providerName} numberOfLines={1}>
      {provider.provider_name}
    </Text>
    <ProviderButton
      provider={provider}
      kind={provider.kind}
      media={media}
      tmdbLink={tmdbLink}
      compact
    />
  </View>
);

const ProviderSection = ({
  providers,
  media,
  region,
  fetchedAt,
  isRefreshing,
  onRefresh,
  isConfigured,
}) => {
  const available = hasProviders(providers);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Where to watch</Text>
          <Text style={styles.subtitle}>
            {formatUpdatedAgo(fetchedAt)}
            {region ? ` · ${region}` : ''}
          </Text>
        </View>

        <Pressable
          onPress={onRefresh}
          disabled={isRefreshing || !isConfigured}
          style={styles.refresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh streaming providers"
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.primaryLight} />
          ) : (
            <RefreshCw size={18} color={colors.textSecondary} />
          )}
        </Pressable>
      </View>

      {!available ? (
        <Text style={styles.empty}>
          {isConfigured
            ? `No streaming information for ${region || 'this region'} yet.`
            : 'Streaming info unavailable offline.'}
        </Text>
      ) : (
        <>
          {GROUPS.map((group) => {
            const list = providers[group.key] ?? [];

            if (list.length === 0) {
              return null;
            }

            return (
              <View key={group.key} style={styles.group}>
                <Text style={styles.groupTitle}>{group.label}</Text>

                {list.map((provider) => (
                  <ProviderRow
                    key={provider.provider_id}
                    provider={provider}
                    media={media}
                    tmdbLink={providers.link}
                  />
                ))}
              </View>
            );
          })}

          {providers.link ? (
            <Pressable
              onPress={() => openExternalLink(providers.link)}
              style={styles.linkButton}
              accessibilityRole="button"
              accessibilityLabel="Open Where to Watch page"
            >
              <Text style={styles.linkText}>Open Where to Watch page</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
};

export default ProviderSection;

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.lg,
    gap: spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  titleBlock: {
    flex: 1,
    gap: 2,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  refresh: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  group: {
    gap: spacing.sm,
  },

  groupTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
  },

  providerName: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.sm,
  },

  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },

  linkText: {
    color: colors.primaryLight,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
