import {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
} from '../database/mediaRepository';
import { MEDIA_TYPES, MEDIA_STATUSES } from '../constants/mediaOptions';
import { parseGenres } from '../constants/genres';
import {
  validateMediaForm,
  formDataToPayload,
  mediaToFormData,
} from './validationService';

export const BACKUP_VERSION = 2;

// Field yang portabel antarperangkat. poster_uri adalah path lokal dan
// providers_* adalah cache jaringan, jadi keduanya tidak diekspor.
const BACKUP_FIELDS = [
  'title',
  'type',
  'genre',
  'release_year',
  'status',
  'rating',
  'description',
  'tmdb_id',
  'poster_path',
  'backdrop_path',
  'tmdb_link',
  'created_at',
  'updated_at',
];

export const loadMedia = (db) => getAllMedia(db);

export const findMedia = (db, id) => getMediaById(db, id);

// Mengembalikan { ok: true, media } atau { ok: false, errors }.
export const addMedia = async (db, formData) => {
  const { isValid, errors } = validateMediaForm(formData);

  if (!isValid) {
    return { ok: false, errors };
  }

  const media = await createMedia(db, formDataToPayload(formData));
  return { ok: true, media };
};

export const editMedia = async (db, id, formData) => {
  const { isValid, errors } = validateMediaForm(formData);

  if (!isValid) {
    return { ok: false, errors };
  }

  const media = await updateMedia(db, id, formDataToPayload(formData));

  if (!media) {
    return { ok: false, errors: { general: 'Media not found.' } };
  }

  return { ok: true, media };
};

export const removeMedia = (db, id) => deleteMedia(db, id);

// Filter murni di memori: query (title/genre), type, status, genre.
export const filterMedia = (
  items,
  { query = '', type = 'ALL', status = 'ALL', genre = 'ALL' } = {}
) => {
  const keyword = query.trim().toLowerCase();
  const genreKey = String(genre ?? 'ALL').toLowerCase();

  return items.filter((item) => {
    if (type !== 'ALL' && item.type !== type) {
      return false;
    }

    if (status !== 'ALL' && item.status !== status) {
      return false;
    }

    if (
      genreKey !== 'all' &&
      !parseGenres(item.genre).some(
        (value) => value.toLowerCase() === genreKey
      )
    ) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    return (
      item.title.toLowerCase().includes(keyword) ||
      (item.genre ?? '').toLowerCase().includes(keyword)
    );
  });
};

// Nilai kosong (null) selalu diletakkan paling bawah, sisanya menurun.
const compareNullableDesc = (a, b) => {
  const aMissing = a === null || a === undefined;
  const bMissing = b === null || b === undefined;

  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  return b - a;
};

export const sortMedia = (items, sortBy = 'RECENT') => {
  const sorted = [...items];

  switch (sortBy) {
    case 'TITLE':
      return sorted.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      );
    case 'RATING':
      return sorted.sort((a, b) => compareNullableDesc(a.rating, b.rating));
    case 'YEAR':
      return sorted.sort((a, b) =>
        compareNullableDesc(a.release_year, b.release_year)
      );
    default:
      // RECENT: urutan bawaan dari database (updated_at DESC).
      return sorted;
  }
};

export const getStatistics = (items) => {
  const byType = {};
  MEDIA_TYPES.forEach((item) => {
    byType[item.value] = 0;
  });

  const byStatus = {};
  MEDIA_STATUSES.forEach((item) => {
    byStatus[item.value] = 0;
  });

  let ratingSum = 0;
  let ratedCount = 0;

  items.forEach((item) => {
    if (byType[item.type] !== undefined) {
      byType[item.type] += 1;
    }

    if (byStatus[item.status] !== undefined) {
      byStatus[item.status] += 1;
    }

    if (item.rating !== null && item.rating !== undefined) {
      ratingSum += Number(item.rating);
      ratedCount += 1;
    }
  });

  return {
    total: items.length,
    byType,
    byStatus,
    ratedCount,
    averageRating: ratedCount > 0 ? ratingSum / ratedCount : null,
  };
};

// ---------------------------------------------------------------
// Backup & restore (JSON teks, tanpa dependency tambahan)
// ---------------------------------------------------------------

export const buildBackup = (items) =>
  JSON.stringify({
    app: 'cinetrack',
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    items: items.map((item) => {
      const picked = {};
      BACKUP_FIELDS.forEach((field) => {
        if (item[field] !== undefined) {
          picked[field] = item[field];
        }
      });
      return picked;
    }),
  });

// Menerima { items: [...] } maupun array langsung (backup v1 tetap valid).
export const parseBackup = (text) => {
  let data;

  try {
    data = JSON.parse(String(text ?? '').trim());
  } catch {
    return { ok: false, error: 'The text is not valid JSON.' };
  }

  const items = Array.isArray(data) ? data : data?.items;

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'No items found in the backup.' };
  }

  return { ok: true, items };
};

// Kunci deduplikasi: tmdb_id|type bila ada, selain itu title|type|year.
const mediaKey = (media) => {
  if (media.tmdb_id !== null && media.tmdb_id !== undefined) {
    return `tmdb:${media.tmdb_id}|${media.type}`;
  }

  return `${String(media.title).trim().toLowerCase()}|${media.type}|${
    media.release_year ?? ''
  }`;
};

// Data yang sudah ada dipertahankan; duplikat dilewati.
export const importBackup = async (db, text) => {
  const parsed = parseBackup(text);

  if (!parsed.ok) {
    return parsed;
  }

  const existing = await getAllMedia(db);
  const seen = new Set(existing.map(mediaKey));
  const payloads = [];
  let duplicates = 0;
  let invalid = 0;

  parsed.items.forEach((raw) => {
    if (!raw || typeof raw !== 'object') {
      invalid += 1;
      return;
    }

    const form = mediaToFormData(raw);

    if (!validateMediaForm(form).isValid) {
      invalid += 1;
      return;
    }

    const payload = formDataToPayload(form);
    const key = mediaKey(payload);

    if (seen.has(key)) {
      duplicates += 1;
      return;
    }

    seen.add(key);
    payloads.push(payload);
  });

  await db.withTransactionAsync(async () => {
    for (const payload of payloads) {
      await createMedia(db, payload);
    }
  });

  return { ok: true, imported: payloads.length, duplicates, invalid };
};
