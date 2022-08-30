import { QueryResult } from '@apollo/client';
import { isPresent } from 'lib';
import {
  AtLeastOneCombiner,
  isAtLeastSubCombiner,
  isAtLeastApiCombiner,
  isRequireBothCombiner,
  isEitherCombiner,
} from './combiners';

export interface KeyExtractor<Sub, Api, K> {
  sub: (g: Sub) => K;
  api: (h: Api) => K;
}

export const simpleKeyExtractor = <Sub, Api, K extends keyof Sub & keyof Api>(
  key: K,
) => ({
  sub: (g: Sub) => g[key],
  api: (a: Api) => a[key],
});

export const combine = <Sub, Api, K, C>(
  subItems: Sub[],
  apiItems: Api[],
  keyExtractor: {
    sub: (g: Sub) => K;
    api: (h: Api) => K;
  },
  combiner: AtLeastOneCombiner<Sub, Api, C>,
): C[] => {
  const subByKey = new Map<K, Sub>(
    subItems.map((g) => [keyExtractor.sub(g), g]),
  );
  const apiByKey = new Map<K, Api>(
    apiItems.map((h) => [keyExtractor.api(h), h]),
  );

  const allKeys = new Set<K>([...subByKey.keys(), ...apiByKey.keys()]);

  return [...allKeys]
    .map((key) => {
      const sub = subByKey.get(key);
      const api = apiByKey.get(key);

      if (sub && api && isRequireBothCombiner(combiner))
        return combiner.requireBoth(sub, api);

      if (sub && isAtLeastSubCombiner(combiner))
        return combiner.atLeastSub(sub, api);

      if (api && isAtLeastApiCombiner(combiner))
        return combiner.atLeastApi(sub, api);

      if ((sub || api) && isEitherCombiner(combiner))
        return combiner.either({ sub: sub!, api });
    })
    .filter(isPresent);
};

type QueryRest<Data = unknown, Vars = unknown> = Omit<
  QueryResult<Data, Vars>,
  'data'
>;

export const combineRest = (sub: QueryRest, api: QueryRest) => ({
  loading: sub.loading || api.loading,
  error: sub.error ?? api.error,
  refetch: () => {
    sub.refetch();
    api.refetch();
  },
});
