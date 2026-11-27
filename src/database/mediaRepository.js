const getAllMedia = async (db) => {
  return db.getAllAsync(
    'SELECT * FROM media ORDER BY updated_at DESC, id DESC'
  );
};

const getMediaById = async (db, id) => {
  return db.getFirstAsync(
    'SELECT * FROM media WHERE id = ?',
    id
  );
};

const findByTmdbId = async (db, tmdbId, type) => {
  if (tmdbId === null || tmdbId === undefined) {
    return null;
  }

  return db.getFirstAsync(
    'SELECT * FROM media WHERE tmdb_id = ? AND type = ?',
    tmdbId,
    type
  );
};

const createMedia = async (db, media) => {
  const result = await db.runAsync(
    `INSERT INTO media (
      title, type, genre, release_year, status, rating, description,
      tmdb_id, poster_path, backdrop_path, poster_uri, tmdb_link,
      providers_json, providers_region, providers_fetched_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    media.title.trim(),
    media.type,
    media.genre || null,
    media.release_year ?? null,
    media.status || 'TO_WATCH',
    media.rating ?? null,
    media.description || null,
    media.tmdb_id ?? null,
    media.poster_path || null,
    media.backdrop_path || null,
    media.poster_uri || null,
    media.tmdb_link || null,
    media.providers_json || null,
    media.providers_region || null,
    media.providers_fetched_at || null
  );

  return getMediaById(db, result.lastInsertRowId);
};

const updateMedia = async (db, id, media) => {
  const result = await db.runAsync(
    `UPDATE media SET
      title = ?,
      type = ?,
      genre = ?,
      release_year = ?,
      status = ?,
      rating = ?,
      description = ?,
      tmdb_id = ?,
      poster_path = ?,
      backdrop_path = ?,
      poster_uri = ?,
      tmdb_link = ?,
      providers_json = ?,
      providers_region = ?,
      providers_fetched_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    media.title.trim(),
    media.type,
    media.genre || null,
    media.release_year ?? null,
    media.status,
    media.rating ?? null,
    media.description || null,
    media.tmdb_id ?? null,
    media.poster_path || null,
    media.backdrop_path || null,
    media.poster_uri || null,
    media.tmdb_link || null,
    media.providers_json || null,
    media.providers_region || null,
    media.providers_fetched_at || null,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getMediaById(db, id);
};

// Cache provider tidak mengubah updated_at supaya urutan "Recent" tetap
// mengikuti aktivitas user, bukan refresh jaringan.
const updateProviders = async (
  db,
  id,
  { providers_json, providers_region, providers_fetched_at }
) => {
  const result = await db.runAsync(
    `UPDATE media SET
      providers_json = ?,
      providers_region = ?,
      providers_fetched_at = ?
    WHERE id = ?`,
    providers_json || null,
    providers_region || null,
    providers_fetched_at || null,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getMediaById(db, id);
};

const deleteMedia = async (db, id) => {
  const result = await db.runAsync(
    'DELETE FROM media WHERE id = ?',
    id
  );

  return result.changes > 0;
};

export {
  getAllMedia,
  getMediaById,
  findByTmdbId,
  createMedia,
  updateMedia,
  updateProviders,
  deleteMedia,
};
