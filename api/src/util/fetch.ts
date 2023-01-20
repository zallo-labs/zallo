import fetch from 'cross-fetch';
import getFetch, { RequestInitWithRetry } from 'fetch-retry';

const defaults: RequestInitWithRetry = {
  retries: 3,
  // Exponential backoff, e.g. 100ms, 200ms, 400ms, ...
  retryDelay: (attempt) => Math.pow(2, attempt) * 100,
};

export const fetchWithRetry = getFetch(fetch, defaults);

export const fetchJsonWithRetry = async (...params: Parameters<typeof fetchWithRetry>) => {
  try {
    const resp = await fetchWithRetry(...params);
    return await resp.json();
  } catch (_) {
    return undefined;
  }
};
