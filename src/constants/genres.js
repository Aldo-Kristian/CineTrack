import colors from './colors';

// Warna dipilih cukup terang agar terbaca di tema gelap.
export const GENRES = [
  { value: 'Action', color: '#F87171' },
  { value: 'Adventure', color: '#FB923C' },
  { value: 'Animation', color: '#A3E635' },
  { value: 'Comedy', color: '#FACC15' },
  { value: 'Crime', color: '#94A3B8' },
  { value: 'Documentary', color: '#A8A29E' },
  { value: 'Drama', color: '#818CF8' },
  { value: 'Family', color: '#4ADE80' },
  { value: 'Fantasy', color: '#E879F9' },
  { value: 'History', color: '#FBBF24' },
  { value: 'Horror', color: '#FB7185' },
  { value: 'Music', color: '#2DD4BF' },
  { value: 'Mystery', color: '#A78BFA' },
  { value: 'Romance', color: '#F472B6' },
  { value: 'Sci-Fi', color: '#22D3EE' },
  { value: 'Thriller', color: '#60A5FA' },
  { value: 'War', color: '#34D399' },
  { value: 'Western', color: '#D4A373' },
];

const findGenre = (name) =>
  GENRES.find(
    (item) => item.value.toLowerCase() === String(name).trim().toLowerCase()
  );

// Genre di luar daftar (data lama / teks bebas) memakai warna netral.
export const getGenreColor = (name) =>
  findGenre(name)?.color ?? colors.textSecondary;

// 'Action, Drama' -> ['Action', 'Drama'] (nama dinormalkan, duplikat dibuang).
export const parseGenres = (value) => {
  if (!value) {
    return [];
  }

  const seen = new Set();
  const result = [];

  String(value)
    .split(',')
    .forEach((raw) => {
      const token = raw.trim();

      if (!token) {
        return;
      }

      const canonical = findGenre(token)?.value ?? token;
      const key = canonical.toLowerCase();

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      result.push(canonical);
    });

  return result;
};

// ['Drama', 'Action'] -> 'Action, Drama' (urutan konsisten mengikuti GENRES).
export const serializeGenres = (list) => {
  const order = GENRES.map((item) => item.value);
  const known = order.filter((value) => list.includes(value));
  const unknown = list.filter((value) => !order.includes(value));

  return [...known, ...unknown].join(', ');
};