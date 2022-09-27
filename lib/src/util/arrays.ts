export type ArrVal<T> = NonNullable<T extends (infer A)[] ? A : undefined>;

export type NonBoolean<T> = T extends boolean ? never : T;

// Required as filter((t?: T) => !!t) => (T | undefined); see https://github.com/microsoft/TypeScript/issues/20812
export const isPresent = <T>(t: T | null | undefined): t is T =>
  t !== undefined && t !== null;

export const isTruthy = <T>(
  t: NonBoolean<T> | boolean | null | undefined,
): t is NonBoolean<T> => !!t;

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

export const filterFirst = <K, V>(
  items: V[],
  key: (item: V) => K,
  comparator: (a: V, b: V) => number = () => 0,
): V[] =>
  [...groupBy(items, key).values()].map((v) => {
    return v.length === 1 ? v[0] : v.sort(comparator)[0];
  });

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

export const upsertItem = <T>(
  array: T[] | undefined,
  item: T,
  predicate: (value: T, index: number) => boolean,
): T[] => {
  if (!array) array = [];

  const index = array.findIndex(predicate);
  if (index === -1) return [...array, item];

  return [...array.slice(0, index), item, ...array.slice(index + 1)];
};
