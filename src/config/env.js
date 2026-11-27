// Token dibaca saat bundle dibuat oleh Expo (EXPO_PUBLIC_*).
// Catatan: nilai ini ikut terbundel di aplikasi klien. Lihat docs/14.
const TMDB_TOKEN = (process.env.EXPO_PUBLIC_TMDB_TOKEN ?? '').trim();

export const isTmdbConfigured = TMDB_TOKEN.length > 0;

export const getTmdbToken = () => TMDB_TOKEN;
