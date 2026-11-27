import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import {
  loadMedia,
  addMedia,
  editMedia,
  removeMedia,
  importBackup,
} from '../services/mediaService';

export const MediaContext = createContext(null);

const SAVE_ERROR = {
  ok: false,
  errors: { general: 'Something went wrong. Please try again.' },
};

export const MediaProvider = ({ children }) => {
  const db = useSQLiteContext();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setItems(await loadMedia(db));
    } catch (error) {
      console.error('Failed to load media', error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    let active = true;

    loadMedia(db)
      .then((rows) => {
        if (active) {
          setItems(rows);
        }
      })
      .catch((error) => {
        console.error('Failed to load media', error);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [db]);

  const add = useCallback(
    async (formData) => {
      try {
        const result = await addMedia(db, formData);
        if (result.ok) {
          await refresh();
        }
        return result;
      } catch (error) {
        console.error('Failed to add media', error);
        return SAVE_ERROR;
      }
    },
    [db, refresh]
  );

  const edit = useCallback(
    async (id, formData) => {
      try {
        const result = await editMedia(db, id, formData);
        if (result.ok) {
          await refresh();
        }
        return result;
      } catch (error) {
        console.error('Failed to edit media', error);
        return SAVE_ERROR;
      }
    },
    [db, refresh]
  );

  const remove = useCallback(
    async (id) => {
      try {
        const deleted = await removeMedia(db, id);
        if (deleted) {
          await refresh();
        }
        return deleted;
      } catch (error) {
        console.error('Failed to delete media', error);
        return false;
      }
    },
    [db, refresh]
  );

  const importItems = useCallback(
    async (text) => {
      try {
        const result = await importBackup(db, text);
        if (result.ok) {
          await refresh();
        }
        return result;
      } catch (error) {
        console.error('Failed to import backup', error);
        return { ok: false, error: 'Import failed. Please try again.' };
      }
    },
    [db, refresh]
  );

  const value = useMemo(
    () => ({ items, isLoading, refresh, add, edit, remove, importItems }),
    [items, isLoading, refresh, add, edit, remove, importItems]
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};