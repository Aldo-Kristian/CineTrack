import {
  mapGenreIds,
  mapTmdbSearchResult,
  mapTmdbDetails,
  isExactTmdbMatch,
} from '../src/services/tmdbMapper';

describe('mapGenreIds', () => {
  test('maps movie genre ids', () => {
    expect(mapGenreIds([878, 28, 12])).toBe('Action, Adventure, Sci-Fi');
  });

  test('maps combined TV genre ids', () => {
    expect(mapGenreIds([10759, 10765])).toBe(
      'Action, Adventure, Fantasy, Sci-Fi'
    );
    expect(mapGenreIds([10762])).toBe('Family');
  });

  test('ignores genres without a CineTrack equivalent', () => {
    expect(mapGenreIds([10763, 10764, 10766, 10767, 10770])).toBe('');
  });
});

describe('mapTmdbSearchResult', () => {
  test('maps a movie result', () => {
    const mapped = mapTmdbSearchResult({
      id: 27205,
      media_type: 'movie',
      title: 'Inception',
      release_date: '2010-07-15',
      genre_ids: [28, 878, 53],
      overview: 'A thief who steals corporate secrets.',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
    });

    expect(mapped).toMatchObject({
      tmdb_id: 27205,
      title: 'Inception',
      type: 'MOVIE',
      genre: 'Action, Sci-Fi, Thriller',
      release_year: '2010',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
    });
  });

  test('maps a TV result and uses first_air_date', () => {
    const mapped = mapTmdbSearchResult({
      id: 1396,
      media_type: 'tv',
      name: 'Breaking Bad',
      first_air_date: '2008-01-20',
      genre_ids: [18, 80],
    });

    expect(mapped.type).toBe('SERIES');
    expect(mapped.title).toBe('Breaking Bad');
    expect(mapped.release_year).toBe('2008');
    expect(mapped.genre).toBe('Crime, Drama');
  });
});

describe('mapTmdbDetails', () => {
  test('prefers detail genres and providers', () => {
    const mapped = mapTmdbDetails(
      'MOVIE',
      {
        id: 27205,
        title: 'Inception',
        release_date: '2010-07-15',
        overview: 'Dreams.',
        genres: [{ id: 878 }, { id: 53 }],
        poster_path: '/p.jpg',
        backdrop_path: '/b.jpg',
      },
      {
        region: 'ID',
        fetchedAt: '2026-11-28T00:00:00.000Z',
        providers: {
          stream: [{ provider_id: 8, provider_name: 'Netflix' }],
          free: [],
          rent: [],
          buy: [],
          link: 'https://www.themoviedb.org/movie/27205/watch',
        },
      }
    );

    expect(mapped.genre).toBe('Sci-Fi, Thriller');
    expect(mapped.providers_region).toBe('ID');
    expect(mapped.tmdb_link).toContain('themoviedb.org');
    expect(JSON.parse(mapped.providers_json).stream).toHaveLength(1);
  });
});

describe('isExactTmdbMatch', () => {
  const candidate = {
    id: 1,
    media_type: 'movie',
    title: 'Dune',
    release_date: '2021-09-15',
  };

  test('requires same title, type, and compatible year', () => {
    expect(
      isExactTmdbMatch(
        { title: 'dune', type: 'MOVIE', release_year: 2021 },
        candidate
      )
    ).toBe(true);
    expect(
      isExactTmdbMatch(
        { title: 'Dune', type: 'MOVIE', release_year: null },
        candidate
      )
    ).toBe(true);
    expect(
      isExactTmdbMatch(
        { title: 'Dune', type: 'SERIES', release_year: 2021 },
        candidate
      )
    ).toBe(false);
    expect(
      isExactTmdbMatch(
        { title: 'Dune 2', type: 'MOVIE', release_year: 2021 },
        candidate
      )
    ).toBe(false);
    expect(
      isExactTmdbMatch(
        { title: 'Dune', type: 'MOVIE', release_year: 1984 },
        candidate
      )
    ).toBe(false);
  });
});
