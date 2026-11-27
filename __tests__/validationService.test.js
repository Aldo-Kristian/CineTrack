import {
  EMPTY_FORM,
  mediaToFormData,
  formDataToPayload,
  validateMediaForm,
} from '../src/services/validationService';

describe('validateMediaForm', () => {
  test('requires only a title', () => {
    expect(validateMediaForm({ title: 'Dune' }).isValid).toBe(true);
    expect(validateMediaForm(EMPTY_FORM).errors.title).toBe(
      'Title is required.'
    );
    expect(validateMediaForm({ title: '   ' }).isValid).toBe(false);
  });

  test('validates optional year, rating, and tmdb id', () => {
    expect(
      validateMediaForm({ title: 'Dune', release_year: '2021' }).isValid
    ).toBe(true);
    expect(
      validateMediaForm({ title: 'Dune', release_year: '1800' }).errors
        .release_year
    ).toBeDefined();
    expect(
      validateMediaForm({ title: 'Dune', rating: 6 }).errors.rating
    ).toBeDefined();
    expect(
      validateMediaForm({ title: 'Dune', tmdb_id: -2 }).errors.tmdb_id
    ).toBeDefined();
  });
});

describe('mediaToFormData / formDataToPayload', () => {
  test('maps v2 columns and keeps v1 rows working', () => {
    const form = mediaToFormData({
      title: 'Breaking Bad',
      type: 'SERIES',
      genre: 'Crime, Drama',
      release_year: 2008,
      status: 'COMPLETED',
      rating: 5,
      description: 'Chemistry.',
      tmdb_id: 1396,
      poster_path: '/p.jpg',
      backdrop_path: '/b.jpg',
      poster_uri: 'file:///poster.jpg',
      tmdb_link: 'https://themoviedb.org/tv/1396',
      providers_json: '{"stream":[]}',
      providers_region: 'ID',
      providers_fetched_at: '2026-11-28T00:00:00.000Z',
    });

    expect(form.release_year).toBe('2008');
    expect(form.tmdb_id).toBe(1396);
    expect(form.poster_uri).toBe('file:///poster.jpg');

    const payload = formDataToPayload(form);
    expect(payload).toMatchObject({
      title: 'Breaking Bad',
      type: 'SERIES',
      release_year: 2008,
      tmdb_id: 1396,
      providers_region: 'ID',
    });
  });

  test('defaults missing type/status and nulls empty optional fields', () => {
    const payload = formDataToPayload({ title: '  Dune  ' });
    expect(payload).toMatchObject({
      title: 'Dune',
      type: 'MOVIE',
      status: 'TO_WATCH',
      genre: null,
      release_year: null,
      tmdb_id: null,
      poster_path: null,
      providers_json: null,
    });
  });
});
