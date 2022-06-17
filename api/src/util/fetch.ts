import isoFetch from 'isomorphic-fetch';
import getFetch, { RequestInitWithRetry } from 'fetch-retry';

const defaults: RequestInitWithRetry = {
  retries: 5,
  // Exponential backoff, e.g. 100ms, 200ms, 400ms, ...
  retryDelay: (attempt) => Math.pow(2, attempt) * 100,
};

export const fetch = getFetch(isoFetch, defaults);

export const fetchJson = async (...params: Parameters<typeof fetch>) => {
  try {
    const resp = await fetch(...params);
    return await resp.json();
  } catch (_) {
    return undefined;
  }
};
