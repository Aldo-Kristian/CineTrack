// Naikkan DATABASE_VERSION dan tambahkan blok migrasi baru setiap kali skema berubah.
const DATABASE_VERSION = 1;

const initializeDatabase = async (db) => {
  const row = await db.getFirstAsync('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

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
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
      CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
    `);

    currentVersion = 1;
  }

  // Contoh migrasi berikutnya:
  // if (currentVersion === 1) {
  //   await db.execAsync('ALTER TABLE media ADD COLUMN poster_url TEXT;');
  //   currentVersion = 2;
  // }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
};

export default initializeDatabase;