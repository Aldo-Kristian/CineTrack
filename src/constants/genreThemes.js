import colors from './colors';
import { GENRES, getPrimaryGenre } from './genres';

const genreColor = (name) =>
  GENRES.find((item) => item.value === name)?.color ?? colors.textSecondary;

const NEUTRAL = {
  variant: 'poster',
  accent: colors.border,
  gradient: [colors.surface, colors.background],
  icon: 'film',
  radius: 8,
};

const THEMES = {
  Action: {
    variant: 'cinematic',
    accent: genreColor('Action'),
    gradient: ['#2A0707', colors.background],
    icon: 'flame',
    radius: 8,
  },
  Adventure: {
    variant: 'cinematic',
    accent: genreColor('Adventure'),
    gradient: ['#2A1405', colors.background],
    icon: 'compass',
    radius: 8,
  },
  Thriller: {
    variant: 'cinematic',
    accent: genreColor('Thriller'),
    gradient: ['#0A1526', colors.background],
    icon: 'eye',
    radius: 8,
  },
  Crime: {
    variant: 'cinematic',
    accent: genreColor('Crime'),
    gradient: ['#161B22', colors.background],
    icon: 'fingerprint',
    radius: 8,
  },
  War: {
    variant: 'cinematic',
    accent: genreColor('War'),
    gradient: ['#0B1F16', colors.background],
    icon: 'swords',
    radius: 8,
  },
  Western: {
    variant: 'cinematic',
    accent: genreColor('Western'),
    gradient: ['#241505', colors.background],
    icon: 'sunset',
    radius: 8,
  },

  Drama: {
    variant: 'poster',
    accent: genreColor('Drama'),
    gradient: [colors.surface, colors.background],
    icon: 'film',
    radius: 8,
  },
  Mystery: {
    variant: 'poster',
    accent: genreColor('Mystery'),
    gradient: [colors.surface, colors.background],
    icon: 'search',
    radius: 8,
  },
  History: {
    variant: 'poster',
    accent: genreColor('History'),
    gradient: [colors.surface, colors.background],
    icon: 'hourglass',
    radius: 8,
  },
  Documentary: {
    variant: 'poster',
    accent: genreColor('Documentary'),
    gradient: ['#1B1B18', colors.background],
    icon: 'book-open',
    radius: 4,
  },

  Comedy: {
    variant: 'vibrant',
    accent: genreColor('Comedy'),
    gradient: ['#30280A', colors.surface],
    icon: 'laugh',
    radius: 16,
  },
  Animation: {
    variant: 'vibrant',
    accent: genreColor('Animation'),
    gradient: ['#18270A', colors.surface],
    icon: 'clapperboard',
    radius: 16,
  },
  Family: {
    variant: 'vibrant',
    accent: genreColor('Family'),
    gradient: ['#0C2614', colors.surface],
    icon: 'users',
    radius: 16,
  },
  Music: {
    variant: 'vibrant',
    accent: genreColor('Music'),
    gradient: ['#072824', colors.surface],
    icon: 'music',
    radius: 16,
  },

  Horror: {
    variant: 'atmospheric',
    accent: genreColor('Horror'),
    gradient: ['#250607', '#000000'],
    icon: 'ghost',
    radius: 10,
  },
  'Sci-Fi': {
    variant: 'atmospheric',
    accent: genreColor('Sci-Fi'),
    gradient: ['#04202A', '#000000'],
    icon: 'rocket',
    radius: 10,
  },
  Fantasy: {
    variant: 'atmospheric',
    accent: genreColor('Fantasy'),
    gradient: ['#1D0B2E', '#000000'],
    icon: 'sparkles',
    radius: 10,
  },
  Romance: {
    variant: 'atmospheric',
    accent: genreColor('Romance'),
    gradient: ['#2A0B1A', '#000000'],
    icon: 'heart',
    radius: 10,
  },
};

// Menerima string genre ('Action, Drama') atau nama genre tunggal.
export const getGenreTheme = (genre) => {
  const primary = getPrimaryGenre(genre);

  if (!primary) {
    return { ...NEUTRAL, primaryGenre: null };
  }

  const theme = THEMES[primary] ?? NEUTRAL;

  return { ...theme, primaryGenre: primary };
};
