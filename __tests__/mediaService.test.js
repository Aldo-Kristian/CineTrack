import {
  BACKUP_VERSION,
  buildBackup,
  parseBackup,
  filterMedia,
} from '../src/services/mediaService';

describe('backup v2', () => {
  const row = {
    id: 7,
    title: 'Dune',
    type: 'MOVIE',
    genre: 'Sci-Fi',
    release_year: 2021,
    status: 'COMPLETED',
    rating: 4.5,
    description: 'Spice.',
    tmdb_id: 438631,
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    tmdb_link: 'https://www.themoviedb.org/movie/438631',
    poster_uri: 'file:///local/poster.jpg',
    providers_json: '{"stream":[]}',
    providers_region: 'ID',
    providers_fetched_at: '2026-11-28T00:00:00.000Z',
    created_at: '2026-11-01 10:00:00',
    updated_at: '2026-11-02 10:00:00',
  };

  test('exports portable fields only', () => {
    const data = JSON.parse(buildBackup([row]));
    expect(data.version).toBe(BACKUP_VERSION);
    expect(data.items[0].tmdb_id).toBe(438631);
    expect(data.items[0].poster_path).toBe('/poster.jpg');
    expect(data.items[0].poster_uri).toBeUndefined();
    expect(data.items[0].providers_json).toBeUndefined();
    expect(data.items[0].id).toBeUndefined();
  });

  test('accepts legacy v1 backups and rejects invalid JSON', () => {
    const v1 = JSON.stringify({
      app: 'cinetrack',
      version: 1,
      items: [{ title: 'Old Title', type: 'MOVIE', status: 'TO_WATCH' }],
    });

    expect(parseBackup(v1)).toEqual({
      ok: true,
      items: [{ title: 'Old Title', type: 'MOVIE', status: 'TO_WATCH' }],
    });
    expect(parseBackup('{oops').ok).toBe(false);
    expect(parseBackup(JSON.stringify({ items: [] })).ok).toBe(false);
  });
});

describe('filterMedia genre filter', () => {
  const items = [
    { title: 'Alien', type: 'MOVIE', status: 'COMPLETED', genre: 'Horror, Sci-Fi' },
    { title: 'Friends', type: 'SERIES', status: 'WATCHING', genre: 'Comedy' },
    { title: 'Dune', type: 'MOVIE', status: 'TO_WATCH', genre: 'Sci-Fi, Adventure' },
  ];

  test('filters by genre case-insensitively and combines with type', () => {
    expect(filterMedia(items, { genre: 'sci-fi' })).toHaveLength(2);
    expect(
      filterMedia(items, { genre: 'Sci-Fi', type: 'MOVIE' }).map(
        (item) => item.title
      )
    ).toEqual(['Alien', 'Dune']);
    expect(filterMedia(items, { genre: 'Comedy' }).map((i) => i.title)).toEqual([
      'Friends',
    ]);
    expect(filterMedia(items, { genre: 'ALL' })).toHaveLength(3);
  });
});
