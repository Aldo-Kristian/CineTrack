import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Check, Square } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { KNOWN_PROVIDERS } from '../constants/streamingProviders';
import useMedia from '../hooks/useMedia';
import ModalSheet from './ModalSheet';
import ProviderLogo from './ProviderLogo';

const SubscriptionPicker = ({ visible, value, region, onClose, onSave }) => {
  const { loadProviderOptions } = useMedia();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(value ?? []);

  useEffect(() => {
    let active = true;

    loadProviderOptions()
      .then((result) => {
        if (!active) {
          return;
        }

        if (result.ok) {
          setOptions(result.providers);
        } else {
          setOptions(KNOWN_PROVIDERS);
          setError(result.error);
        }
      })
      .catch(() => {
        if (active) {
          setOptions(KNOWN_PROVIDERS);
          setError('Cannot load providers for this region.');
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [loadProviderOptions]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return options;
    }

    return options.filter((provider) =>
      String(provider.provider_name).toLowerCase().includes(keyword)
    );
  }, [options, query]);

  const toggle = (providerId) => {
    setSelected((current) =>
      current.includes(providerId)
        ? current.filter((id) => id !== providerId)
        : [...current, providerId]
    );
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={`My streaming subscriptions · ${region}`}
    >
      <Text style={styles.help}>
        Selected services are prioritized for the “Open on …” button on
        cards.
      </Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search providers..."
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.primaryLight} style={styles.loader} />
      ) : null}

      {error ? (
        <Text style={styles.warning}>
          Showing a general provider list. Availability may vary by region.
        </Text>
      ) : null}

      {filtered.map((provider) => {
        const isSelected = selected.includes(provider.provider_id);

        return (
          <Pressable
            key={provider.provider_id}
            onPress={() => toggle(provider.provider_id)}
            style={styles.row}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={provider.provider_name}
          >
            <ProviderLogo provider={provider} size={30} />

            <Text style={styles.name} numberOfLines={1}>
              {provider.provider_name}
            </Text>

            {isSelected ? (
              <Check size={20} color={colors.success} />
            ) : (
              <Square size={20} color={colors.textMuted} />
            )}
          </Pressable>
        );
      })}

      <View style={styles.actions}>
        <Pressable
          style={styles.clear}
          onPress={() => setSelected([])}
          accessibilityRole="button"
          accessibilityLabel="Clear subscriptions"
        >
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>

        <Pressable
          style={styles.save}
          onPress={() => onSave(selected)}
          accessibilityRole="button"
          accessibilityLabel="Save subscriptions"
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
    </ModalSheet>
  );
};

export default SubscriptionPicker;

const styles = StyleSheet.create({
  help: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },

  loader: {
    marginTop: spacing.lg,
  },

  warning: {
    color: colors.warning,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },

  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  name: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
  },

  clear: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  clearText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  save: {
    flex: 2,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },

  saveText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});
