export type ArrVal<T> = NonNullable<T extends (infer A)[] ? A : undefined>;

// Required as filter((t?: T) => !!t) => (T | undefined); see https://github.com/microsoft/TypeScript/issues/20812
export const isPresent = <T>(t: T | null | undefined): t is T => t !== undefined && t !== null;

// Lodash-like groupBy, but using Map to allow for arbitrary keys
export const groupBy = <K, V>(items: V[], key: (item: V) => K): Map<K, V[]> => {
  const m = new Map<K, V[]>();

  for (const item of items) {
    const k = key(item);
    const v = m.get(k);

    if (v) {
      m.set(k, [...v, item]);
    } else {
      m.set(k, [item]);
    }
  }

  return m;
};

export const filterFirst = <K, V>(items: V[], key: (item: V) => K): V[] =>
  [...groupBy(items, key).values()].map((v) => v[0]);

export const mapAsync = async <T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>,
): Promise<U[]> => Promise.all(array.map(callbackfn));

export const filterAsync = async <T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>,
): Promise<T[]> => {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((_, index) => filterMap[index]);
};
