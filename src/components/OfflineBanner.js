import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

const OfflineBanner = ({
  message = 'Offline — you can still add manually.',
}) => (
  <View style={styles.container} accessibilityRole="alert">
    <WifiOff size={18} color={colors.warning} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

export default OfflineBanner;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.warning}66`,
    backgroundColor: `${colors.warning}14`,
  },

  text: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
});
