import {
  normalizeProviders,
  parseProviders,
  serializeProviders,
  pickPrimaryProvider,
  getSecondaryProviders,
  buildProviderLink,
  isStale,
  formatUpdatedAgo,
  hasProviders,
} from '../src/services/providerService';

const block = {
  link: 'https://www.themoviedb.org/movie/1/watch?locale=ID',
  flatrate: [
    {
      provider_id: 489,
      provider_name: 'Vidio',
      logo_path: '/vidio.jpg',
      display_priority: 18,
    },
    {
      provider_id: 8,
      provider_name: 'Netflix',
      logo_path: '/netflix.jpg',
      display_priority: 0,
    },
  ],
  free: [
    {
      provider_id: 192,
      provider_name: 'YouTube',
      logo_path: '/yt.jpg',
      display_priority: 5,
    },
  ],
  ads: [
    {
      provider_id: 300,
      provider_name: 'Pluto TV',
      logo_path: '/pluto.jpg',
      display_priority: 4,
    },
  ],
  rent: [
    {
      provider_id: 2,
      provider_name: 'Apple TV',
      logo_path: '/apple.jpg',
      display_priority: 4,
    },
  ],
  buy: [
    {
      provider_id: 3,
      provider_name: 'Google Play Movies',
      logo_path: '/gpm.jpg',
      display_priority: 6,
    },
  ],
};

describe('normalizeProviders', () => {
  test('groups and sorts by display_priority', () => {
    const providers = normalizeProviders({ ID: block }, 'ID');
    expect(providers.stream.map((p) => p.provider_id)).toEqual([8, 489]);
    expect(providers.free.map((p) => p.provider_id)).toEqual([300, 192]);
    expect(providers.rent).toHaveLength(1);
    expect(providers.buy).toHaveLength(1);
    expect(providers.link).toContain('themoviedb.org');
    expect(hasProviders(providers)).toBe(true);
  });

  test('returns empty groups when region is missing', () => {
    const providers = normalizeProviders({ ID: block }, 'US');
    expect(hasProviders(providers)).toBe(false);
    expect(providers.link).toBeNull();
  });
});

describe('serializeProviders / parseProviders', () => {
  test('round-trips and tolerates invalid JSON', () => {
    const providers = normalizeProviders({ ID: block }, 'ID');
    expect(parseProviders(serializeProviders(providers))).toEqual(providers);
    expect(parseProviders('not json')).toEqual({
      stream: [],
      free: [],
      rent: [],
      buy: [],
      link: null,
    });
    expect(parseProviders(null)).toEqual({
      stream: [],
      free: [],
      rent: [],
      buy: [],
      link: null,
    });
  });
});

describe('pickPrimaryProvider', () => {
  const providers = normalizeProviders({ ID: block }, 'ID');

  test('prefers subscribed streaming provider, then priority', () => {
    const primary = pickPrimaryProvider(providers, [489]);
    expect(primary.kind).toBe('stream');
    expect(primary.provider.provider_id).toBe(489);
  });

  test('falls back to first stream, then rent/buy if needed', () => {
    expect(pickPrimaryProvider(providers).provider.provider_id).toBe(8);

    const rentOnly = normalizeProviders(
      { ID: { link: 'x', rent: block.rent } },
      'ID'
    );
    expect(pickPrimaryProvider(rentOnly)).toMatchObject({
      kind: 'rent',
      provider: { provider_id: 2 },
    });
  });

  test('returns null when there are no providers', () => {
    expect(pickPrimaryProvider(normalizeProviders(null, 'ID'))).toBeNull();
  });
});

describe('getSecondaryProviders', () => {
  test('returns up to 3 unique providers excluding primary', () => {
    const providers = normalizeProviders({ ID: block }, 'ID');
    const secondary = getSecondaryProviders(providers, { provider_id: 8 });
    expect(secondary.map((p) => p.provider_id)).toEqual([489, 300, 192]);
  });
});

describe('buildProviderLink', () => {
  const media = { title: 'Spider-Man: No Way Home', type: 'MOVIE' };

  test('uses a verified template and encodes the title', () => {
    const link = buildProviderLink(
      { provider_id: 8, provider_name: 'Netflix' },
      media,
      'https://tmdb/fallback'
    );
    expect(link).toBe(
      'https://www.netflix.com/search?q=Spider-Man%3A%20No%20Way%20Home'
    );
  });

  test('uses the TMDB link when no template exists', () => {
    const link = buildProviderLink(
      { provider_id: 999, provider_name: 'Unknown' },
      media,
      'https://tmdb/fallback'
    );
    expect(link).toBe('https://tmdb/fallback');
  });

  test('returns null without template or fallback', () => {
    expect(buildProviderLink({ provider_id: 999 }, media, null)).toBeNull();
  });
});

describe('isStale / formatUpdatedAgo', () => {
  test('null or invalid values are stale', () => {
    expect(isStale(null)).toBe(true);
    expect(isStale('nope')).toBe(true);
  });

  test('recent fetch is fresh, old fetch is stale', () => {
    const now = new Date().toISOString();
    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    expect(isStale(now)).toBe(false);
    expect(isStale(old)).toBe(true);
    expect(formatUpdatedAgo(now)).toBe('Updated today');
  });
});
