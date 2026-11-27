export const getSetting = async (db, key) => {
  const row = await db.getFirstAsync(
    'SELECT value FROM app_settings WHERE key = ?',
    key
  );

  return row?.value ?? null;
};

export const getAllSettings = async (db) => {
  const rows = await db.getAllAsync('SELECT key, value FROM app_settings');
  const result = {};

  rows.forEach((row) => {
    result[row.key] = row.value;
  });

  return result;
};

export const setSetting = async (db, key, value) => {
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    String(value)
  );
};

export const deleteSetting = async (db, key) => {
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', key);
};
