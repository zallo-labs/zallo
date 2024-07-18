import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { FetchPolicy } from 'relay-runtime';
import { RequestIdentifier } from 'relay-runtime/lib/util/getRequestIdentifier';
import { atomEffect } from 'jotai-effect';

const TTL = 5 * 60_000;
const ttlLastUpdated = atom(Date.now());
export function useTtlLastUpdated() {
  return useAtomValue(ttlLastUpdated);
}

const updateTtlEffect = atomEffect((get, set) => {
  // Update TTL immediately if it's been more than TTL since last update
  if (get.peek(ttlLastUpdated) < Date.now() - TTL) set(ttlLastUpdated, Date.now());

  const timer = setInterval(() => {
    set(ttlLastUpdated, Date.now());
  }, TTL);

  return () => clearInterval(timer);
});

const requestLastFetched = atomFamily((_requestId: RequestIdentifier) => atom<number>(0));

export function useSetRequestLastFetched(id: RequestIdentifier) {
  return useSetAtom(requestLastFetched(id));
}

const requestFetchPolicy = atomFamily((requestId: RequestIdentifier) =>
  atom((get): FetchPolicy => {
    const lastFetched = get(requestLastFetched(requestId));

    const lastUpdated = get(ttlLastUpdated);
    get(updateTtlEffect);

    return lastFetched < lastUpdated - TTL ? 'store-and-network' : 'store-or-network';
  }),
);

export function useTtlFetchPolicy(id: RequestIdentifier) {
  return useAtomValue(requestFetchPolicy(id));
}
