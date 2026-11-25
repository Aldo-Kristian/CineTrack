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

const createMedia = async (db, media) => {
  const result = await db.runAsync(
    `INSERT INTO media (
      title, type, genre, release_year, status, rating, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    media.title.trim(),
    media.type,
    media.genre || null,
    media.release_year ?? null,
    media.status || 'TO_WATCH',
    media.rating ?? null,
    media.description || null
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
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    media.title.trim(),
    media.type,
    media.genre || null,
    media.release_year ?? null,
    media.status,
    media.rating ?? null,
    media.description || null,
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
  createMedia,
  updateMedia,
  deleteMedia,
};
