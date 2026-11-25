import {
  MEDIA_TYPES,
  MEDIA_STATUSES,
  RATING_MIN,
  RATING_MAX,
} from '../constants/mediaOptions';

const MIN_YEAR = 1888;
const MAX_YEAR = new Date().getFullYear() + 10;

export const EMPTY_FORM = {
  title: '',
  type: 'MOVIE',
  genre: '',
  release_year: '',
  status: 'TO_WATCH',
  rating: null,
  description: '',
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
});

// State form -> payload untuk repository (tipe sesuai kolom DB).
export const formDataToPayload = (form) => {
  const year = String(form.release_year ?? '').trim();
  const genre = String(form.genre ?? '').trim();
  const description = String(form.description ?? '').trim();

  return {
    title: String(form.title ?? '').trim(),
    type: form.type,
    genre: genre || null,
    release_year: year ? parseInt(year, 10) : null,
    status: form.status,
    rating: form.rating ?? null,
    description: description || null,
  };
};

export const validateMediaForm = (form) => {
  const errors = {};

  if (!String(form.title ?? '').trim()) {
    errors.title = 'Title is required.';
  }

  if (!MEDIA_TYPES.some((item) => item.value === form.type)) {
    errors.type = 'Please choose a valid type.';
  }

  if (!MEDIA_STATUSES.some((item) => item.value === form.status)) {
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

  return { isValid: Object.keys(errors).length === 0, errors };
};