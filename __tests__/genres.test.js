import {
  GENRE_PRIORITY,
  parseGenres,
  serializeGenres,
  getPrimaryGenre,
} from '../src/constants/genres';

describe('parseGenres / serializeGenres', () => {
  test('normalizes names, trims, and removes duplicates', () => {
    expect(parseGenres(' drama, ACTION, Action , sci-fi ')).toEqual([
      'Drama',
      'Action',
      'Sci-Fi',
    ]);
  });

  test('serializes in GENRES order and keeps unknown genres', () => {
    expect(serializeGenres(['Drama', 'Action', 'Telenovela'])).toBe(
      'Action, Drama, Telenovela'
    );
  });

  test('handles empty input', () => {
    expect(parseGenres('')).toEqual([]);
    expect(parseGenres(null)).toEqual([]);
    expect(serializeGenres([])).toBe('');
  });
});

describe('getPrimaryGenre', () => {
  test('uses the documented priority, not storage order', () => {
    expect(getPrimaryGenre('Drama, Horror')).toBe('Horror');
    expect(getPrimaryGenre('Action, Sci-Fi')).toBe('Sci-Fi');
    expect(getPrimaryGenre('Comedy, Romance')).toBe('Romance');
    expect(getPrimaryGenre('Adventure, Action')).toBe('Action');
  });

  test('returns null without genres and falls back to first unknown genre', () => {
    expect(getPrimaryGenre('')).toBeNull();
    expect(getPrimaryGenre('Telenovela, Drama')).toBe('Drama');
    expect(getPrimaryGenre('Telenovela')).toBe('Telenovela');
  });

  test('priority list matches the specification order', () => {
    expect(GENRE_PRIORITY.slice(0, 6)).toEqual([
      'Horror',
      'Sci-Fi',
      'Fantasy',
      'Animation',
      'Romance',
      'Comedy',
    ]);
  });
});
