import _ from 'lodash';

export type ArrVal<T> = NonNullable<T extends (infer A)[] ? A : undefined>;

// Required as filter((t?: T) => !!t) => (T | undefined); see https://github.com/microsoft/TypeScript/issues/20812
export const isPresent = <T>(t: T | undefined): t is T => !!t;

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

export const filterUnique = <K, V>(items: V[], key: (item: V) => K): V[] =>
  [...groupBy(items, key).values()].map((v) => v[0]);
