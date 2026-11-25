export const YEAR_MIN = 1888;

// Rilis mendatang diperbolehkan sampai 5 tahun ke depan.
export const getYearMax = () => new Date().getFullYear() + 5;

// Daftar tahun menurun (terbaru di atas), dalam bentuk string.
export const getYearOptions = () => {
  const options = [];

  for (let year = getYearMax(); year >= YEAR_MIN; year -= 1) {
    options.push(String(year));
  }

  return options;
};