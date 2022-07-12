import { AtomEffect } from 'recoil';

type FetchResult<T> = Parameters<Parameters<AtomEffect<T>>[0]['setSelf']>[0];

export interface RefreshAtomOptions<T> {
  fetch: () => FetchResult<T>;
  interval: number;
}

export const refreshAtom =
  <T>({ fetch, interval }: RefreshAtomOptions<T>): AtomEffect<T> =>
  ({ setSelf }) => {
    const handle = setInterval(async () => {
      setSelf(await fetch());
    }, interval);

    return () => clearInterval(handle);
  };
