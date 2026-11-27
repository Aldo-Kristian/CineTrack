import { Alert, Linking } from 'react-native';

import { buildProviderLink } from '../services/providerService';

export const openExternalLink = async (url) => {
  if (!url) {
    Alert.alert('Cannot open the link', 'No streaming link is available.');
    return false;
  }

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert(
      'Cannot open the link',
      'The app or browser could not open this URL.'
    );
    return false;
  }
};

// Aturan berlapis: template provider -> link TMDB/JustWatch -> alert.
export const openProvider = (provider, media, tmdbLink) => {
  const url = buildProviderLink(provider, media, tmdbLink);
  return openExternalLink(url);
};
