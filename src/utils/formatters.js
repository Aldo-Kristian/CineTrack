import colors from '../constants/colors';
import {
  MEDIA_TYPES,
  MEDIA_STATUSES,
  RATING_MAX,
} from '../constants/mediaOptions';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const STATUS_COLORS = {
  TO_WATCH: colors.status.toWatch,
  WATCHING: colors.status.watching,
  COMPLETED: colors.status.completed,
};

export const getStatusColor = (status) =>
  STATUS_COLORS[status] || colors.textMuted;

export const formatMediaType = (type) =>
  MEDIA_TYPES.find((item) => item.value === type)?.label ?? 'Unknown';

export const formatStatus = (status) =>
  MEDIA_STATUSES.find((item) => item.value === status)?.label ?? 'Unknown';

export const formatRating = (rating) =>
  rating === null || rating === undefined
    ? 'Not rated'
    : `${Number(rating).toFixed(1)} / ${RATING_MAX}`;

// SQLite CURRENT_TIMESTAMP: 'YYYY-MM-DD HH:MM:SS' (UTC).
export const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(`${String(value).replace(' ', 'T')}Z`);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};