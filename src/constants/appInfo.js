import appConfig from '../../app.json';

// Versi aplikasi selalu mengikuti app.json agar tidak terjadi drift.
export const APP_VERSION = appConfig?.expo?.version ?? '2.0.0';
