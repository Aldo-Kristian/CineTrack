import { getTmdbToken, isTmdbConfigured } from '../config/env';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const TIMEOUT_MS = 8000;

export class TmdbError extends Error {
  constructor(message, { code = 'UNKNOWN', status = null } = {}) {
    super(message);
    this.name = 'TmdbError';
    this.code = code;
    this.status = status;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = (path, params = {}) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${BASE_URL}${path}${query ? `?${query}` : ''}`;
};

// Satu pintu untuk semua request TMDB: timeout, 1 retry jaringan, dan
// pemetaan error yang ramah.
export const tmdbRequest = async (path, { params, signal } = {}) => {
  if (!isTmdbConfigured) {
    throw new TmdbError(
      'Online features are off because no TMDB token is configured.',
      { code: 'NOT_CONFIGURED' }
    );
  }

  const attempt = async (allowRetry) => {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    const abortFromOutside = () => controller.abort();
    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', abortFromOutside, { once: true });
      }
    }

    try {
      const response = await fetch(buildUrl(path, params), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getTmdbToken()}`,
          accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new TmdbError(
            'TMDB rejected the token. Check EXPO_PUBLIC_TMDB_TOKEN.',
            { code: 'AUTH', status: 401 }
          );
        }

        if (response.status === 429) {
          throw new TmdbError(
            'Too many requests. Please try again in a moment.',
            { code: 'RATE_LIMIT', status: 429 }
          );
        }

        throw new TmdbError('TMDB request failed. Please try again.', {
          code: 'SERVER',
          status: response.status,
        });
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TmdbError) {
        throw error;
      }

      if (signal?.aborted) {
        throw new TmdbError('Request cancelled.', { code: 'ABORTED' });
      }

      const isNetworkError = timedOut || error?.name === 'AbortError';

      if (allowRetry) {
        await wait(300);
        return attempt(false);
      }

      throw new TmdbError(
        isNetworkError
          ? 'You appear to be offline. Check your connection and try again.'
          : 'Cannot reach TMDB right now. Please try again later.',
        { code: 'OFFLINE' }
      );
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener?.('abort', abortFromOutside);
    }
  };

  return attempt(true);
};

export const searchMulti = async (query, { signal } = {}) => {
  const data = await tmdbRequest('/search/multi', {
    params: {
      query: query.trim(),
      include_adult: false,
      language: 'en-US',
      page: 1,
    },
    signal,
  });

  return (data.results ?? []).filter(
    (item) => item.media_type === 'movie' || item.media_type === 'tv'
  );
};

const detailsPath = (type, tmdbId) =>
  type === 'SERIES' ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;

export const getDetails = async (type, tmdbId, { signal } = {}) => {
  return tmdbRequest(detailsPath(type, tmdbId), {
    params: {
      language: 'en-US',
      append_to_response: 'watch/providers',
    },
    signal,
  });
};

export const getWatchProviders = async (type, tmdbId, { signal } = {}) => {
  const data = await tmdbRequest(`${detailsPath(type, tmdbId)}/watch/providers`, {
    signal,
  });

  return data.results ?? {};
};

export const getAvailableProviders = async (region, { signal } = {}) => {
  const [movies, tv] = await Promise.all([
    tmdbRequest('/watch/providers/movie', {
      params: { language: 'en-US', watch_region: region },
      signal,
    }),
    tmdbRequest('/watch/providers/tv', {
      params: { language: 'en-US', watch_region: region },
      signal,
    }),
  ]);

  const merged = new Map();

  [...(movies.results ?? []), ...(tv.results ?? [])].forEach((provider) => {
    if (!merged.has(provider.provider_id)) {
      merged.set(provider.provider_id, {
        provider_id: provider.provider_id,
        provider_name: provider.provider_name,
        logo_path: provider.logo_path ?? null,
        display_priority: provider.display_priority ?? 999,
      });
    }
  });

  return [...merged.values()].sort(
    (a, b) => a.display_priority - b.display_priority
  );
};

export const imageUrl = (path, size = 'w342') => {
  if (!path) {
    return null;
  }

  return `${IMAGE_BASE_URL}${size}${path}`;
};

export const tmdbWebUrl = (type, tmdbId) => {
  if (!tmdbId) {
    return null;
  }

  return type === 'SERIES'
    ? `https://www.themoviedb.org/tv/${tmdbId}`
    : `https://www.themoviedb.org/movie/${tmdbId}`;
};
