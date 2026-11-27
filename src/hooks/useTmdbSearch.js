import { useEffect, useState } from 'react';

import { isTmdbConfigured } from '../config/env';
import { searchMulti } from '../services/tmdbClient';
import useDebouncedValue from './useDebouncedValue';

const MIN_QUERY_LENGTH = 2;

const EMPTY = {
  query: '',
  status: 'idle',
  results: [],
  errorCode: null,
  errorMessage: null,
};

// State yang dikembalikan: idle | loading | success | empty | error | offline.
const useTmdbSearch = (query) => {
  const trimmed = String(query ?? '').trim();
  const debounced = useDebouncedValue(trimmed, 400);
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    if (!isTmdbConfigured || debounced.length < MIN_QUERY_LENGTH) {
      return undefined;
    }

    const controller = new AbortController();

    searchMulti(debounced, { signal: controller.signal })
      .then((results) => {
        setState({
          query: debounced,
          status: results.length > 0 ? 'success' : 'empty',
          results,
          errorCode: null,
          errorMessage: null,
        });
      })
      .catch((error) => {
        if (error?.code === 'ABORTED') {
          return;
        }

        setState({
          query: debounced,
          status: error?.code === 'OFFLINE' ? 'offline' : 'error',
          results: [],
          errorCode: error?.code ?? 'UNKNOWN',
          errorMessage:
            error?.message ?? 'Cannot search online right now.',
        });
      });

    return () => controller.abort();
  }, [debounced]);

  let status = state.status;

  if (!isTmdbConfigured) {
    status = 'disabled';
  } else if (debounced.length < MIN_QUERY_LENGTH) {
    status = 'idle';
  } else if (state.query !== debounced) {
    status = 'loading';
  }

  return {
    status,
    results: state.query === debounced ? state.results : [],
    errorCode: state.errorCode,
    errorMessage: state.errorMessage,
    debouncedQuery: debounced,
  };
};

export default useTmdbSearch;
