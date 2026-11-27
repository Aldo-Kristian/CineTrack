// Provider ID mengikuti TMDB. Hanya provider yang ID-nya sudah diverifikasi
// dari respons resmi /watch/providers/* atau dokumentasi TMDB yang diberi
// template pencarian. Provider lain tetap tampil memakai nama + logo dari API
// dan fallback ke halaman "Where to watch" TMDB/JustWatch.
//
// Template diverifikasi HTTP 200 (lihat docs/14):
// Netflix, Prime Video, Apple TV, YouTube, Google Play Movies, Vidio, Viu.
export const PROVIDER_TEMPLATES = {
  8: {
    name: 'Netflix',
    searchUrl: 'https://www.netflix.com/search?q={title}',
  },
  9: {
    name: 'Amazon Prime Video',
    searchUrl: 'https://www.primevideo.com/search/?phrase={title}',
  },
  119: {
    name: 'Amazon Prime Video',
    searchUrl: 'https://www.primevideo.com/search/?phrase={title}',
  },
  2: {
    name: 'Apple TV',
    searchUrl: 'https://tv.apple.com/search?term={title}',
  },
  350: {
    name: 'Apple TV Plus',
    searchUrl: 'https://tv.apple.com/search?term={title}',
  },
  3: {
    name: 'Google Play Movies',
    searchUrl: 'https://play.google.com/store/search?q={title}&c=movies',
  },
  192: {
    name: 'YouTube',
    searchUrl: 'https://www.youtube.com/results?search_query={title}',
  },
  489: {
    name: 'Vidio',
    searchUrl: 'https://www.vidio.com/search?q={title}',
  },
  158: {
    name: 'Viu',
    searchUrl: 'https://www.viu.com/ott/id/en/search?q={title}',
  },
};

// Katalog fallback untuk Settings ketika daftar provider online tidak bisa
// dimuat. ID tetap mengikuti TMDB; status ketersediaan per negara tetap
// ditentukan API saat online.
export const KNOWN_PROVIDERS = [
  { provider_id: 8, provider_name: 'Netflix' },
  { provider_id: 119, provider_name: 'Amazon Prime Video' },
  { provider_id: 9, provider_name: 'Amazon Prime Video' },
  { provider_id: 2, provider_name: 'Apple TV' },
  { provider_id: 350, provider_name: 'Apple TV Plus' },
  { provider_id: 122, provider_name: 'Hotstar' },
  { provider_id: 337, provider_name: 'Disney Plus' },
  { provider_id: 3, provider_name: 'Google Play Movies' },
  { provider_id: 192, provider_name: 'YouTube' },
  { provider_id: 158, provider_name: 'Viu' },
  { provider_id: 489, provider_name: 'Vidio' },
  { provider_id: 159, provider_name: 'Catchplay' },
  { provider_id: 11, provider_name: 'MUBI' },
  { provider_id: 283, provider_name: 'Crunchyroll' },
  { provider_id: 425, provider_name: 'HBO Go' },
  { provider_id: 483, provider_name: 'MAX Stream' },
  { provider_id: 384, provider_name: 'HBO Max' },
  { provider_id: 309, provider_name: 'Sun Nxt' },
  { provider_id: 190, provider_name: 'Curiosity Stream' },
];

export const getProviderTemplate = (providerId) =>
  PROVIDER_TEMPLATES[Number(providerId)] ?? null;

export const getKnownProviderName = (providerId) =>
  KNOWN_PROVIDERS.find(
    (item) => item.provider_id === Number(providerId)
  )?.provider_name ?? null;
