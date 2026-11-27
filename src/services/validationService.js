import {
  MEDIA_TYPES,
  MEDIA_STATUSES,
  RATING_MIN,
  RATING_MAX,
} from '../constants/mediaOptions';

const MIN_YEAR = 1888;
const MAX_YEAR = new Date().getFullYear() + 10;

const textOrEmpty = (value) => (value === null || value === undefined ? '' : String(value));

export const EMPTY_FORM = {
  title: '',
  type: 'MOVIE',
  genre: '',
  release_year: '',
  status: 'TO_WATCH',
  rating: null,
  description: '',
  tmdb_id: null,
  poster_path: '',
  backdrop_path: '',
  poster_uri: '',
  tmdb_link: '',
  providers_json: '',
  providers_region: '',
  providers_fetched_at: '',
};

// Data dari DB -> state form (TextInput butuh string).
export const mediaToFormData = (media) => ({
  title: media.title ?? '',
  type: media.type ?? 'MOVIE',
  genre: media.genre ?? '',
  release_year:
    media.release_year !== null && media.release_year !== undefined
      ? String(media.release_year)
      : '',
  status: media.status ?? 'TO_WATCH',
  rating: media.rating ?? null,
  description: media.description ?? '',
  tmdb_id: media.tmdb_id ?? null,
  poster_path: textOrEmpty(media.poster_path),
  backdrop_path: textOrEmpty(media.backdrop_path),
  poster_uri: textOrEmpty(media.poster_uri),
  tmdb_link: textOrEmpty(media.tmdb_link),
  providers_json: textOrEmpty(media.providers_json),
  providers_region: textOrEmpty(media.providers_region),
  providers_fetched_at: textOrEmpty(media.providers_fetched_at),
});

const nullableText = (value) => {
  const text = String(value ?? '').trim();
  return text || null;
};

// State form -> payload untuk repository (tipe sesuai kolom DB).
export const formDataToPayload = (form) => {
  const year = String(form.release_year ?? '').trim();
  const genre = String(form.genre ?? '').trim();
  const description = String(form.description ?? '').trim();

  const type = MEDIA_TYPES.some((item) => item.value === form.type)
    ? form.type
    : 'MOVIE';
  const status = MEDIA_STATUSES.some((item) => item.value === form.status)
    ? form.status
    : 'TO_WATCH';

  return {
    title: String(form.title ?? '').trim(),
    type,
    genre: genre || null,
    release_year: year ? parseInt(year, 10) : null,
    status,
    rating: form.rating ?? null,
    description: description || null,
    tmdb_id:
      form.tmdb_id === null || form.tmdb_id === undefined || form.tmdb_id === ''
        ? null
        : Number(form.tmdb_id),
    poster_path: nullableText(form.poster_path),
    backdrop_path: nullableText(form.backdrop_path),
    poster_uri: nullableText(form.poster_uri),
    tmdb_link: nullableText(form.tmdb_link),
    providers_json: nullableText(form.providers_json),
    providers_region: nullableText(form.providers_region),
    providers_fetched_at: nullableText(form.providers_fetched_at),
  };
};

export const validateMediaForm = (form) => {
  const errors = {};

  if (!String(form.title ?? '').trim()) {
    errors.title = 'Title is required.';
  }

  // Type dan status punya default; hanya nilai eksplisit yang salah ditolak.
  if (form.type && !MEDIA_TYPES.some((item) => item.value === form.type)) {
    errors.type = 'Please choose a valid type.';
  }

  if (form.status && !MEDIA_STATUSES.some((item) => item.value === form.status)) {
    errors.status = 'Please choose a valid status.';
  }

  const year = String(form.release_year ?? '').trim();
  if (year) {
    const yearNumber = Number(year);
    if (
      !Number.isInteger(yearNumber) ||
      yearNumber < MIN_YEAR ||
      yearNumber > MAX_YEAR
    ) {
      errors.release_year = `Release year must be between ${MIN_YEAR} and ${MAX_YEAR}.`;
    }
  }

  if (form.rating !== null && form.rating !== undefined) {
    if (
      typeof form.rating !== 'number' ||
      form.rating < RATING_MIN ||
      form.rating > RATING_MAX
    ) {
      errors.rating = `Rating must be between ${RATING_MIN} and ${RATING_MAX}.`;
    }
  }

  if (form.tmdb_id !== null && form.tmdb_id !== undefined && form.tmdb_id !== '') {
    const tmdbId = Number(form.tmdb_id);
    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      errors.tmdb_id = 'TMDB id must be a positive integer.';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
