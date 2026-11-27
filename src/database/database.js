// Naikkan DATABASE_VERSION dan tambahkan blok migrasi baru setiap kali skema berubah.
const DATABASE_VERSION = 2;

const MEDIA_COLUMNS_V2 = `
  tmdb_id INTEGER,
  poster_path TEXT,
  backdrop_path TEXT,
  poster_uri TEXT,
  tmdb_link TEXT,
  providers_json TEXT,
  providers_region TEXT,
  providers_fetched_at TEXT
`;

const createMediaTableV2 = `
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    type TEXT NOT NULL CHECK (type IN ('MOVIE', 'SERIES')),
    genre TEXT,
    release_year INTEGER,
    status TEXT NOT NULL DEFAULT 'TO_WATCH'
      CHECK (status IN ('TO_WATCH', 'WATCHING', 'COMPLETED')),
    rating REAL CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ${MEDIA_COLUMNS_V2}
  );
`;

const createIndexesV2 = `
  CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
  CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_media_tmdb
    ON media(tmdb_id, type) WHERE tmdb_id IS NOT NULL;
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

const initializeDatabase = async (db) => {
  const row = await db.getFirstAsync('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  // WAL harus diatur di luar transaksi.
  await db.execAsync('PRAGMA journal_mode = WAL;');

  try {
    await db.withTransactionAsync(async () => {
      if (currentVersion === 0) {
        // Instalasi baru langsung memakai skema v2.
        await db.execAsync(createMediaTableV2);
        await db.execAsync(createIndexesV2);
        currentVersion = 2;
      }

      if (currentVersion === 1) {
        // Upgrade v1 -> v2 tanpa menghilangkan data lama.
        await db.execAsync(`
          ALTER TABLE media ADD COLUMN tmdb_id INTEGER;
          ALTER TABLE media ADD COLUMN poster_path TEXT;
          ALTER TABLE media ADD COLUMN backdrop_path TEXT;
          ALTER TABLE media ADD COLUMN poster_uri TEXT;
          ALTER TABLE media ADD COLUMN tmdb_link TEXT;
          ALTER TABLE media ADD COLUMN providers_json TEXT;
          ALTER TABLE media ADD COLUMN providers_region TEXT;
          ALTER TABLE media ADD COLUMN providers_fetched_at TEXT;
        `);
        await db.execAsync(createIndexesV2);
        currentVersion = 2;
      }

      await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    });
  } catch (error) {
    // Biarkan SQLiteProvider menampilkan error; transaksi sudah di-rollback.
    console.error('Database migration failed', error);
    throw error;
  }
};

export default initializeDatabase;
