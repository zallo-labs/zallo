import _ from 'lodash';

export type ArrVal<T> = NonNullable<T extends (infer A)[] ? A : undefined>;

// Required as filter((t?: T) => !!t) => (T | undefined); see https://github.com/microsoft/TypeScript/issues/20812
export const isPresent = <T>(t: T | undefined): t is T => !!t;

export const filterUnique = <T, K>(items: T[], key: (item: T) => K): T[] =>
  _.map(_.groupBy(items, key), ([firstItem]) => firstItem);
