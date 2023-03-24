import { MaybePromise } from 'lib';
import { AtomEffect, DefaultValue } from 'recoil';

interface RefreshParams {
  get: Parameters<AtomEffect<unknown>>[0]['getPromise'];
}

type RefreshResult<T> = DefaultValue | MaybePromise<T>;

export interface RefreshAtomOptions<T> {
  refresh: (params: RefreshParams) => RefreshResult<T>;
  interval: number;
  cancelIf?: (value: DefaultValue | T) => boolean;
}

export const refreshAtom =
  <T>({ refresh, interval, cancelIf }: RefreshAtomOptions<T>): AtomEffect<T> =>
  ({ setSelf, onSet, getPromise }) => {
    let isActive = true;
    let handle: NodeJS.Timer | undefined = undefined;

    const maybeCancel = (value: DefaultValue | T) => {
      if (isActive && handle !== undefined && cancelIf?.(value)) {
        isActive = false;
        clearInterval(handle);
      }
    };

    handle = setInterval(async () => {
      const value = await refresh({ get: getPromise });

      setSelf(value);
      maybeCancel(value);
    }, interval);

    onSet((newValue) => {
      maybeCancel(newValue);
    });

    return () => {
      if (isActive) clearInterval(handle);
    };
  };
