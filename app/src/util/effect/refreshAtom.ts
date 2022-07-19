import { mapAsync, MaybePromise } from 'lib';
import { AtomEffect, DefaultValue, RecoilValue } from 'recoil';

type RecoilValueArray<T extends Array<unknown>> = {
  [K in keyof T]: RecoilValue<T[K]>;
};

type ParamOption<P> = P extends [unknown]
  ? { params: RecoilValueArray<P> }
  : { params?: [] };

type FetchResult<T> = DefaultValue | MaybePromise<T>;

export type RefreshAtomOptions<T, P extends unknown[]> = {
  fetch: (...params: P) => FetchResult<T>;
  interval: number;
  cancelIf?: (value: DefaultValue | T) => boolean;
} & ParamOption<P>;

export const refreshAtom =
  <T, Params extends unknown[]>({
    fetch,
    params,
    interval,
    cancelIf,
  }: RefreshAtomOptions<T, Params>): AtomEffect<T> =>
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
      const rParams = (await mapAsync(params ?? [], getPromise)) as Params;
      const value = await fetch(...rParams);

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
