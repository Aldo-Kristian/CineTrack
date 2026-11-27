import { useMemo } from 'react';

import { parseGenres } from '../constants/genres';
import useMedia from '../hooks/useMedia';
import {
  parseProviders,
  pickPrimaryProvider,
  getSecondaryProviders,
} from '../services/providerService';

// Logika bersama semua varian kartu: tipe, tahun, genre, rating, provider.
const useCardMedia = (media) => {
  const { subscriptions } = useMedia();

  return useMemo(() => {
    const providers = parseProviders(media?.providers_json);
    const primary = pickPrimaryProvider(providers, subscriptions);
    const secondary = getSecondaryProviders(
      providers,
      primary?.provider ?? null,
      3
    );

    return {
      providers,
      primary,
      secondary,
      genres: parseGenres(media?.genre).slice(0, 2),
      typeLabel: media?.type === 'SERIES' ? 'Series' : 'Movie',
      year: media?.release_year,
      hasRating: media?.rating !== null && media?.rating !== undefined,
    };
  }, [media, subscriptions]);
};

export default useCardMedia;
