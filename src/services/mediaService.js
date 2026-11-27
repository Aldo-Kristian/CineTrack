import {
  getAllMedia,
  getMediaById,
  findByTmdbId,
  createMedia,
  updateMedia,
  updateProviders,
  deleteMedia,
} from '../database/mediaRepository';
import { MEDIA_TYPES, MEDIA_STATUSES } from '../constants/mediaOptions';
import { parseGenres } from '../constants/genres';
import { isTmdbConfigured } from '../config/env';
import {
  searchMulti,
  getDetails,
  getWatchProviders,
  getAvailableProviders,
} from './tmdbClient';
import {
  mapTmdbSearchResult,
  mapTmdbDetails,
  mapTmdbToPayload,
  isExactTmdbMatch,
  tmdbTypeToMediaType,
} from './tmdbMapper';
import {
  normalizeProviders,
  providersFromDetails,
  serializeProviders,
  isStale,
  EMPTY_PROVIDERS,
} from './providerService';
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

// Undo delete: data lengkap (termasuk cache provider) dimasukkan kembali
// sebagai record baru. ID lama tidak dipakai ulang.
export const restoreMedia = async (db, media) => {
  const form = mediaToFormData(media);
  const payload = formDataToPayload(form);
  return createMedia(db, payload);
};

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

// ---------------------------------------------------------------
// TMDB integration (service layer; screen tidak memanggil fetch)
// ---------------------------------------------------------------

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isAbortError = (error) => error?.code === 'ABORTED';

// Preview untuk bottom sheet konfirmasi. Jika detail gagal (mis. offline),
// tetap kembalikan data dasar dari hasil pencarian supaya user bisa menyimpan.
export const fetchTmdbPreview = async (tmdbResult, region) => {
  const type = tmdbTypeToMediaType(tmdbResult?.media_type);

  try {
    const details = await getDetails(type, tmdbResult.id);
    let providers = providersFromDetails(details, region);

    if (!details?.['watch/providers']) {
      try {
        const results = await getWatchProviders(type, tmdbResult.id);
        providers = normalizeProviders(results, region);
      } catch {
        providers = { ...EMPTY_PROVIDERS };
      }
    }

    return {
      ok: true,
      degraded: false,
      data: mapTmdbDetails(type, details, { providers, region }),
    };
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    const basic = mapTmdbSearchResult(tmdbResult);

    return {
      ok: true,
      degraded: true,
      error,
      data: {
        ...basic,
        providers_json: serializeProviders({ ...EMPTY_PROVIDERS }),
        providers_region: region,
        providers_fetched_at: '',
      },
    };
  }
};

// Tambah dari hasil TMDB. Duplikat (tmdb_id + type) ditolak ramah.
export const addMediaFromTmdb = async (
  db,
  tmdbResult,
  { status = 'TO_WATCH', rating = null, region = 'ID' } = {}
) => {
  const type = tmdbTypeToMediaType(tmdbResult?.media_type);
  const tmdbId = tmdbResult?.id;

  if (!tmdbId) {
    return {
      ok: false,
      errors: { general: 'This title has no TMDB id.' },
    };
  }

  const existing = await findByTmdbId(db, tmdbId, type);

  if (existing) {
    return {
      ok: false,
      duplicate: true,
      existing,
      errors: { general: 'Already in your collection.' },
    };
  }

  let details = null;
  let providers = { ...EMPTY_PROVIDERS };
  let degraded = false;

  try {
    details = await getDetails(type, tmdbId);
    providers = providersFromDetails(details, region);

    if (!details?.['watch/providers']) {
      try {
        providers = normalizeProviders(
          await getWatchProviders(type, tmdbId),
          region
        );
      } catch {
        providers = { ...EMPTY_PROVIDERS };
      }
    }
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    degraded = true;
    details = tmdbResult;
  }

  const payload = mapTmdbToPayload(type, details, {
    providers,
    region,
    fetchedAt: degraded ? null : new Date().toISOString(),
    status,
    rating,
  });

  const { isValid, errors } = validateMediaForm(mediaToFormData(payload));

  if (!isValid) {
    return { ok: false, errors };
  }

  try {
    const media = await createMedia(db, payload);
    return { ok: true, media, degraded };
  } catch (error) {
    if (String(error?.message ?? '').includes('UNIQUE constraint failed')) {
      return {
        ok: false,
        duplicate: true,
        errors: { general: 'Already in your collection.' },
      };
    }

    throw error;
  }
};

export const refreshProvidersForMedia = async (db, media, region) => {
  if (!media?.tmdb_id) {
    return { ok: false, error: 'This title has no TMDB match.' };
  }

  const results = await getWatchProviders(media.type, media.tmdb_id, {});
  const providers = normalizeProviders(results, region);
  const fetchedAt = new Date().toISOString();

  const updated = await updateProviders(db, media.id, {
    providers_json: serializeProviders(providers),
    providers_region: region,
    providers_fetched_at: fetchedAt,
  });

  if (!updated) {
    return { ok: false, error: 'Media not found.' };
  }

  return { ok: true, media: updated, providers };
};

// Dipakai untuk background refresh dan setelah region berubah.
export const refreshProviderCaches = async (
  db,
  items,
  region,
  { limit = 20, onProgress } = {}
) => {
  const targets = items.filter((item) => item.tmdb_id).slice(0, limit);
  let updated = 0;
  let failed = 0;

  for (let index = 0; index < targets.length; index += 1) {
    const media = targets[index];
    onProgress?.({ current: index + 1, total: targets.length, media });

    try {
      const result = await refreshProvidersForMedia(db, media, region);
      if (result.ok) {
        updated += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      failed += 1;
      console.warn('Provider refresh failed', media.id, error?.message);
    }

    if (index < targets.length - 1) {
      await delay(250);
    }
  }

  return { updated, failed, total: targets.length };
};

export const shouldRefreshProviders = (media, region) =>
  Boolean(media?.tmdb_id) &&
  (media.providers_region !== region ||
    !media.providers_fetched_at ||
    isStale(media.providers_fetched_at));

export const getProviderCatalog = async (region) => {
  if (!isTmdbConfigured) {
    return { ok: false, error: 'Online features are off.' };
  }

  try {
    const providers = await getAvailableProviders(region);
    return { ok: true, providers };
  } catch (error) {
    return {
      ok: false,
      error: error?.message ?? 'Cannot load streaming providers.',
    };
  }
};

const mergeMappedIntoForm = (form, mapped, overwrite = false) => {
  const next = { ...form };

  if (mapped.tmdb_id) {
    next.tmdb_id = mapped.tmdb_id;
  }

  if (mapped.poster_path) {
    next.poster_path = mapped.poster_path;
  }

  if (mapped.backdrop_path) {
    next.backdrop_path = mapped.backdrop_path;
  }

  if (mapped.tmdb_link) {
    next.tmdb_link = mapped.tmdb_link;
  }

  if (mapped.providers_json) {
    next.providers_json = mapped.providers_json;
    next.providers_region = mapped.providers_region ?? '';
    next.providers_fetched_at = mapped.providers_fetched_at ?? '';
  }

  const fill = (field, value) => {
    if (overwrite || !String(next[field] ?? '').trim()) {
      if (value !== undefined && value !== null && String(value).trim()) {
        next[field] = value;
      }
    }
  };

  fill('genre', mapped.genre);
  fill('release_year', mapped.release_year);
  fill('description', mapped.description);

  return next;
};

const loadMappedForCandidate = async (media, candidate, region) => {
  const type = media.type;
  const tmdbId = candidate.id ?? candidate.tmdb_id;

  try {
    const details = await getDetails(type, tmdbId);
    let providers = providersFromDetails(details, region);

    if (!details?.['watch/providers']) {
      try {
        providers = normalizeProviders(
          await getWatchProviders(type, tmdbId),
          region
        );
      } catch {
        providers = { ...EMPTY_PROVIDERS };
      }
    }

    return mapTmdbDetails(type, details, { providers, region });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    const basic = mapTmdbSearchResult({
      ...candidate,
      media_type: type === 'SERIES' ? 'tv' : 'movie',
    });

    return {
      ...basic,
      providers_json: serializeProviders({ ...EMPTY_PROVIDERS }),
      providers_region: region,
      providers_fetched_at: '',
    };
  }
};

// 3.7 — lengkapi item lama. Auto-apply hanya untuk exact match.
export const enrichExistingMedia = async (
  db,
  items,
  region,
  { onProgress, signal } = {}
) => {
  const targets = items.filter((item) => !item.tmdb_id);
  const review = [];
  let applied = 0;
  let failed = 0;

  for (let index = 0; index < targets.length; index += 1) {
    if (signal?.aborted) {
      return { ok: true, cancelled: true, applied, review, failed };
    }

    const media = targets[index];
    onProgress?.({
      current: index + 1,
      total: targets.length,
      title: media.title,
    });

    try {
      const results = await searchMulti(media.title, { signal });
      const exact = results.find((candidate) =>
        isExactTmdbMatch(media, candidate)
      );

      if (exact) {
        const mapped = await loadMappedForCandidate(media, exact, region);
        const nextForm = mergeMappedIntoForm(
          mediaToFormData(media),
          mapped,
          false
        );

        await updateMedia(db, media.id, formDataToPayload(nextForm));
        applied += 1;
      } else if (results.length > 0) {
        review.push({ media, candidates: results.slice(0, 3) });
      }
    } catch (error) {
      if (isAbortError(error)) {
        return { ok: true, cancelled: true, applied, review, failed };
      }

      failed += 1;
    }

    if (index < targets.length - 1) {
      await delay(250);
    }
  }

  return { ok: true, cancelled: false, applied, review, failed };
};

export const applyTmdbMatch = async (
  db,
  media,
  candidate,
  region,
  { overwrite = false } = {}
) => {
  const mapped = await loadMappedForCandidate(media, candidate, region);
  const nextForm = mergeMappedIntoForm(
    mediaToFormData(media),
    mapped,
    overwrite
  );
  const payload = formDataToPayload(nextForm);

  const { isValid, errors } = validateMediaForm(nextForm);

  if (!isValid) {
    return { ok: false, errors };
  }

  const updated = await updateMedia(db, media.id, payload);

  if (!updated) {
    return { ok: false, errors: { general: 'Media not found.' } };
  }

  return { ok: true, media: updated };
};
