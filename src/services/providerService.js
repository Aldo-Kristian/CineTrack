import { getProviderTemplate } from '../constants/streamingProviders';

export const EMPTY_PROVIDERS = {
  stream: [],
  free: [],
  rent: [],
  buy: [],
  link: null,
};

const toList = (items, kind) => {
  const seen = new Set();

  return (items ?? [])
    .filter((item) => {
      if (!item || item.provider_id === undefined) {
        return false;
      }

      if (seen.has(item.provider_id)) {
        return false;
      }

      seen.add(item.provider_id);
      return true;
    })
    .sort(
      (a, b) =>
        (a.display_priority ?? 999) - (b.display_priority ?? 999)
    )
    .map((item) => ({
      provider_id: item.provider_id,
      provider_name: item.provider_name,
      logo_path: item.logo_path ?? null,
      display_priority: item.display_priority ?? 999,
      kind,
    }));
};

// watch/providers.results[region] -> struktur yang stabil untuk SQLite.
export const normalizeProviders = (results, region) => {
  const block = results?.[region] ?? null;

  if (!block) {
    return { ...EMPTY_PROVIDERS };
  }

  return {
    stream: toList(block.flatrate, 'stream'),
    free: toList([...(block.free ?? []), ...(block.ads ?? [])], 'free'),
    rent: toList(block.rent, 'rent'),
    buy: toList(block.buy, 'buy'),
    link: block.link ?? null,
  };
};

// Dari respons append_to_response=watch/providers.
export const providersFromDetails = (details, region) => {
  const block = details?.['watch/providers'] ?? details?.watchProviders ?? null;
  return normalizeProviders(block?.results ?? null, region);
};

export const serializeProviders = (providers) => JSON.stringify(providers);

export const parseProviders = (value) => {
  if (!value) {
    return { ...EMPTY_PROVIDERS };
  }

  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value;

    if (!data || typeof data !== 'object') {
      return { ...EMPTY_PROVIDERS };
    }

    return {
      stream: Array.isArray(data.stream) ? data.stream : [],
      free: Array.isArray(data.free) ? data.free : [],
      rent: Array.isArray(data.rent) ? data.rent : [],
      buy: Array.isArray(data.buy) ? data.buy : [],
      link: data.link ?? null,
    };
  } catch {
    return { ...EMPTY_PROVIDERS };
  }
};

export const hasProviders = (providers) =>
  Boolean(
    providers &&
      (providers.stream.length ||
        providers.free.length ||
        providers.rent.length ||
        providers.buy.length)
  );

export const getAllProviders = (providers) => {
  const seen = new Set();
  const result = [];

  ['stream', 'free', 'rent', 'buy'].forEach((kind) => {
    (providers?.[kind] ?? []).forEach((provider) => {
      if (!seen.has(provider.provider_id)) {
        seen.add(provider.provider_id);
        result.push({ ...provider, kind });
      }
    });
  });

  return result;
};

// Provider utama: stream -> free -> rent/buy. Subscription user diprioritaskan.
export const pickPrimaryProvider = (providers, subscribedIds = []) => {
  if (!providers) {
    return null;
  }

  const subscriptions = new Set(
    (subscribedIds ?? []).map((id) => Number(id))
  );

  const pickFrom = (list, kind) => {
    if (!list?.length) {
      return null;
    }

    const subscribed = list.find((item) =>
      subscriptions.has(Number(item.provider_id))
    );

    return { provider: subscribed ?? list[0], kind };
  };

  return (
    pickFrom(providers.stream, 'stream') ??
    pickFrom(providers.free, 'free') ??
    pickFrom(providers.rent, 'rent') ??
    pickFrom(providers.buy, 'buy')
  );
};

// Maksimal 3 logo lain, tanpa menduplikasi provider utama.
export const getSecondaryProviders = (
  providers,
  primaryProvider = null,
  max = 3
) => {
  return getAllProviders(providers)
    .filter(
      (provider) => provider.provider_id !== primaryProvider?.provider_id
    )
    .slice(0, max);
};

// Template terverifikasi -> URL pencarian; jika tidak ada -> link TMDB/JustWatch.
export const buildProviderLink = (provider, media, tmdbLink) => {
  if (!provider) {
    return tmdbLink ?? null;
  }

  const template = getProviderTemplate(provider.provider_id);

  if (template) {
    const title = encodeURIComponent(String(media?.title ?? '').trim());
    return template.searchUrl.replace('{title}', title);
  }

  return tmdbLink ?? null;
};

export const isStale = (fetchedAt, days = 7) => {
  if (!fetchedAt) {
    return true;
  }

  const date = new Date(String(fetchedAt).replace(' ', 'T'));

  if (Number.isNaN(date.getTime())) {
    return true;
  }

  return Date.now() - date.getTime() > days * 24 * 60 * 60 * 1000;
};

export const formatUpdatedAgo = (fetchedAt) => {
  if (!fetchedAt) {
    return 'Never updated';
  }

  const date = new Date(String(fetchedAt).replace(' ', 'T'));

  if (Number.isNaN(date.getTime())) {
    return 'Never updated';
  }

  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));

  if (days <= 0) {
    return 'Updated today';
  }

  if (days === 1) {
    return 'Updated 1 day ago';
  }

  return `Updated ${days} days ago`;
};
