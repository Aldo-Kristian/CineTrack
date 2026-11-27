import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getLocales } from 'expo-localization';

import {
  loadMedia,
  addMedia,
  editMedia,
  removeMedia,
  restoreMedia,
  importBackup,
  addMediaFromTmdb,
  fetchTmdbPreview,
  refreshProvidersForMedia,
  refreshProviderCaches,
  shouldRefreshProviders,
  getProviderCatalog,
  enrichExistingMedia,
  applyTmdbMatch,
} from '../services/mediaService';
import { getSetting, setSetting } from '../database/settingsRepository';
import { isTmdbConfigured } from '../config/env';
import { deleteLocalFile } from '../utils/files';

export const MediaContext = createContext(null);

const SAVE_ERROR = {
  ok: false,
  errors: { general: 'Something went wrong. Please try again.' },
};

const detectRegion = () => {
  const code = getLocales()?.[0]?.regionCode;
  return code ? String(code).toUpperCase() : 'ID';
};

const parseSubscriptions = (value) => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((id) => Number(id)).filter(Number.isFinite)
      : [];
  } catch {
    return [];
  }
};

export const MediaProvider = ({ children }) => {
  const db = useSQLiteContext();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegionState] = useState(detectRegion);
  const [subscriptions, setSubscriptionsState] = useState([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const didBackgroundRefresh = useRef(false);
  const pendingPosterDeletions = useRef(new Map());

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

  // Region & subscription disimpan di app_settings.
  useEffect(() => {
    let active = true;

    Promise.all([
      getSetting(db, 'region'),
      getSetting(db, 'subscriptions'),
    ])
      .then(([storedRegion, storedSubscriptions]) => {
        if (!active) {
          return;
        }

        if (storedRegion) {
          setRegionState(String(storedRegion).toUpperCase());
        }

        setSubscriptionsState(parseSubscriptions(storedSubscriptions));
      })
      .catch((error) => {
        console.error('Failed to load settings', error);
      })
      .finally(() => {
        if (active) {
          setSettingsLoaded(true);
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
        const target = items.find((item) => item.id === id) ?? null;
        const deleted = await removeMedia(db, id);
        if (deleted) {
          // Beri waktu 6 detik untuk Undo sebelum file poster lokal dihapus.
          if (target?.poster_uri) {
            const uri = target.poster_uri;
            const timer = setTimeout(() => {
              deleteLocalFile(uri);
              pendingPosterDeletions.current.delete(id);
            }, 6000);

            pendingPosterDeletions.current.set(id, { timer, uri });
          }

          await refresh();
        }
        return { ok: deleted, media: target };
      } catch (error) {
        console.error('Failed to delete media', error);
        return { ok: false, media: null };
      }
    },
    [db, items, refresh]
  );

  const restore = useCallback(
    async (media) => {
      try {
        const pending = pendingPosterDeletions.current.get(media.id);
        if (pending) {
          clearTimeout(pending.timer);
          pendingPosterDeletions.current.delete(media.id);
        }

        const restored = await restoreMedia(db, media);
        await refresh();
        return { ok: true, media: restored };
      } catch (error) {
        console.error('Failed to restore media', error);
        return { ok: false };
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

  const addFromTmdb = useCallback(
    async (tmdbResult, options = {}) => {
      try {
        const result = await addMediaFromTmdb(db, tmdbResult, {
          region,
          ...options,
        });

        if (result.ok) {
          await refresh();
        }

        return result;
      } catch (error) {
        console.error('Failed to add from TMDB', error);
        return SAVE_ERROR;
      }
    },
    [db, refresh, region]
  );

  const previewTmdb = useCallback(
    (tmdbResult) => fetchTmdbPreview(tmdbResult, region),
    [region]
  );

  const refreshProviders = useCallback(
    async (media) => {
      try {
        const result = await refreshProvidersForMedia(db, media, region);
        if (result.ok) {
          await refresh();
        }
        return result;
      } catch (error) {
        return {
          ok: false,
          error: error?.message ?? 'Cannot refresh streaming info.',
        };
      }
    },
    [db, refresh, region]
  );

  const changeRegion = useCallback(
    async (code) => {
      const nextRegion = String(code ?? '')
        .trim()
        .toUpperCase();

      if (!/^[A-Z]{2}$/.test(nextRegion)) {
        return { ok: false, error: 'Use a 2-letter country code (e.g. ID).' };
      }

      await setSetting(db, 'region', nextRegion);
      setRegionState(nextRegion);

      let updated = 0;

      if (isTmdbConfigured) {
        const result = await refreshProviderCaches(db, items, nextRegion, {
          limit: 20,
        });
        updated = result.updated;
        await refresh();
      }

      return { ok: true, region: nextRegion, updated };
    },
    [db, items, refresh]
  );

  const setSubscriptions = useCallback(
    async (ids) => {
      const clean = [...new Set((ids ?? []).map(Number).filter(Number.isFinite))];
      await setSetting(db, 'subscriptions', JSON.stringify(clean));
      setSubscriptionsState(clean);
      return clean;
    },
    [db]
  );

  const loadProviderOptions = useCallback(
    () => getProviderCatalog(region),
    [region]
  );

  const enrichItems = useCallback(
    async (options = {}) => {
      const result = await enrichExistingMedia(db, items, region, options);
      await refresh();
      return result;
    },
    [db, items, refresh, region]
  );

  const applyMatch = useCallback(
    async (media, candidate, options = {}) => {
      const result = await applyTmdbMatch(
        db,
        media,
        candidate,
        region,
        options
      );
      if (result.ok) {
        await refresh();
      }
      return result;
    },
    [db, refresh, region]
  );

  // Refresh cache provider di latar belakang, maksimal 20 per sesi.
  useEffect(() => {
    if (
      didBackgroundRefresh.current ||
      !settingsLoaded ||
      isLoading ||
      !isTmdbConfigured ||
      items.length === 0
    ) {
      return;
    }

    const candidates = items
      .filter(
        (item) =>
          (item.status === 'TO_WATCH' || item.status === 'WATCHING') &&
          shouldRefreshProviders(item, region)
      )
      .slice(0, 20);

    if (candidates.length === 0) {
      didBackgroundRefresh.current = true;
      return;
    }

    didBackgroundRefresh.current = true;

    refreshProviderCaches(db, candidates, region, {
      limit: candidates.length,
    })
      .then((result) => {
        if (result.updated > 0) {
          return refresh();
        }
        return null;
      })
      .catch((error) => {
        console.warn('Background provider refresh failed', error?.message);
      });
  }, [db, isLoading, items, refresh, region, settingsLoaded]);

  useEffect(
    () => () => {
      pendingPosterDeletions.current.forEach(({ timer }) => clearTimeout(timer));
      pendingPosterDeletions.current.clear();
    },
    []
  );

  const value = useMemo(
    () => ({
      items,
      isLoading,
      refresh,
      add,
      edit,
      remove,
      restore,
      importItems,
      addFromTmdb,
      previewTmdb,
      refreshProviders,
      changeRegion,
      region,
      subscriptions,
      setSubscriptions,
      loadProviderOptions,
      enrichItems,
      applyMatch,
      isTmdbConfigured,
    }),
    [
      items,
      isLoading,
      refresh,
      add,
      edit,
      remove,
      restore,
      importItems,
      addFromTmdb,
      previewTmdb,
      refreshProviders,
      changeRegion,
      region,
      subscriptions,
      setSubscriptions,
      loadProviderOptions,
      enrichItems,
      applyMatch,
    ]
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
