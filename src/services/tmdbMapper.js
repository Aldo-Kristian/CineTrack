import { GENRES, serializeGenres } from '../constants/genres';
import {
  normalizeProviders,
  providersFromDetails,
  serializeProviders,
} from './providerService';
import { tmdbWebUrl } from './tmdbClient';

// Genre ID TMDB -> GENRES CineTrack. Genre tanpa padanan diabaikan
// (TV Movie, News, Reality, Talk, Soap).
export const TMDB_GENRE_MAP = {
  28: ['Action'],
  12: ['Adventure'],
  16: ['Animation'],
  35: ['Comedy'],
  80: ['Crime'],
  99: ['Documentary'],
  18: ['Drama'],
  10751: ['Family'],
  14: ['Fantasy'],
  36: ['History'],
  27: ['Horror'],
  10402: ['Music'],
  9648: ['Mystery'],
  10749: ['Romance'],
  878: ['Sci-Fi'],
  10770: [],
  53: ['Thriller'],
  10752: ['War'],
  37: ['Western'],
  // Genre khusus TV
  10759: ['Action', 'Adventure'],
  10762: ['Family'],
  10763: [],
  10764: [],
  10765: ['Sci-Fi', 'Fantasy'],
  10766: [],
  10767: [],
  10768: ['War'],
};

const KNOWN_GENRES = new Set(GENRES.map((item) => item.value));

export const mapGenreIds = (genreIds = []) => {
  const seen = new Set();
  const result = [];

  genreIds.forEach((id) => {
    (TMDB_GENRE_MAP[id] ?? []).forEach((name) => {
      if (KNOWN_GENRES.has(name) && !seen.has(name)) {
        seen.add(name);
        result.push(name);
      }
    });
  });

  return serializeGenres(result);
};

export const tmdbTypeToMediaType = (mediaType) =>
  mediaType === 'tv' ? 'SERIES' : 'MOVIE';

export const mediaTypeToTmdbType = (type) =>
  type === 'SERIES' ? 'tv' : 'movie';

const yearFromDate = (value) => {
  const text = String(value ?? '').trim();

  if (!/^\d{4}/.test(text)) {
    return '';
  }

  return text.slice(0, 4);
};

export const tmdbTitle = (result) => result?.title ?? result?.name ?? '';

export const tmdbYear = (result) =>
  yearFromDate(result?.release_date ?? result?.first_air_date);

export const tmdbDateRaw = (result) =>
  result?.release_date ?? result?.first_air_date ?? '';

// Hasil search -> form CineTrack. Semua nilai string agar cocok dengan
// state form; providers belum tersedia di tahap ini.
export const mapTmdbSearchResult = (result) => {
  const mediaType = tmdbTypeToMediaType(result?.media_type);

  return {
    tmdb_id: result?.id ?? null,
    title: tmdbTitle(result),
    type: mediaType,
    genre: mapGenreIds(result?.genre_ids),
    release_year: tmdbYear(result),
    description: result?.overview ?? '',
    poster_path: result?.poster_path ?? '',
    backdrop_path: result?.backdrop_path ?? '',
    tmdb_link: tmdbWebUrl(mediaType, result?.id) ?? '',
  };
};

// Detail (+ providers) -> form CineTrack.
export const mapTmdbDetails = (
  type,
  details,
  { providers, region, fetchedAt = new Date().toISOString() } = {}
) => {
  const safeType = type === 'SERIES' ? 'SERIES' : 'MOVIE';
  const genreIds = (details?.genres ?? []).map((item) => item.id);
  const normalizedProviders =
    providers ?? providersFromDetails(details, region);

  return {
    tmdb_id: details?.id ?? null,
    title: tmdbTitle(details),
    type: safeType,
    genre: mapGenreIds(
      genreIds.length ? genreIds : details?.genre_ids ?? []
    ),
    release_year: tmdbYear(details),
    description: details?.overview ?? '',
    poster_path: details?.poster_path ?? '',
    backdrop_path: details?.backdrop_path ?? '',
    tmdb_link:
      normalizedProviders.link ??
      tmdbWebUrl(safeType, details?.id) ??
      '',
    providers_json: serializeProviders(normalizedProviders),
    providers_region: region ?? '',
    providers_fetched_at: fetchedAt,
  };
};

// Payload siap simpan (nilai kosong menjadi null).
export const mapTmdbToPayload = (
  type,
  details,
  { providers, region, fetchedAt, status = 'TO_WATCH', rating = null } = {}
) => {
  const mapped = mapTmdbDetails(type, details, {
    providers,
    region,
    fetchedAt,
  });
  const year = String(mapped.release_year ?? '').trim();

  return {
    title: mapped.title,
    type: mapped.type,
    genre: mapped.genre || null,
    release_year: year ? parseInt(year, 10) : null,
    status,
    rating: rating ?? null,
    description: mapped.description || null,
    tmdb_id: mapped.tmdb_id,
    poster_path: mapped.poster_path || null,
    backdrop_path: mapped.backdrop_path || null,
    tmdb_link: mapped.tmdb_link || null,
    providers_json: mapped.providers_json || null,
    providers_region: mapped.providers_region || null,
    providers_fetched_at: mapped.providers_fetched_at || null,
  };
};

export const normalizeTitle = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

// Aturan auto-apply 3.7: judul sama (case-insensitive), tipe sama, dan
// tahun kosong atau sama.
export const isExactTmdbMatch = (media, candidate) => {
  if (!media || !candidate) {
    return false;
  }

  const candidateType = tmdbTypeToMediaType(candidate.media_type);

  if (media.type !== candidateType) {
    return false;
  }

  if (normalizeTitle(media.title) !== normalizeTitle(tmdbTitle(candidate))) {
    return false;
  }

  if (media.release_year === null || media.release_year === undefined) {
    return true;
  }

  return Number(media.release_year) === Number(tmdbYear(candidate));
};

// Untuk debug/test: memastikan provider di response detail dipakai.
export const mapDetailsProviders = (details, region) =>
  normalizeProviders(details?.['watch/providers']?.results ?? null, region);
