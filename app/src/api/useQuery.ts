import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { useCallback } from 'react';
import { useLazyLoadQuery, useSubscribeToInvalidationState } from 'react-relay';
import { DataID, GraphQLTaggedNode, OperationType, VariablesOf } from 'relay-runtime';

const queryFetchKey = atomFamily((_query: GraphQLTaggedNode) => atom(0) /* referential equality */);

export type QueryOptions = Parameters<typeof useLazyLoadQuery>[2];

export function useQuery<TQuery extends OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: VariablesOf<TQuery>,
  invalidateOn: DataID[] = [],
  options?: QueryOptions,
): TQuery['response'] {
  const query = useLazyLoadQuery<TQuery>(gqlQuery, variables, {
    fetchKey: useAtomValue(queryFetchKey(gqlQuery)),
    ...options,
  });

  useInvalidateQueryOn(gqlQuery, invalidateOn);

  return query;
}

export function useInvalidateQueryOn(gqlQuery: GraphQLTaggedNode, dataIDs: DataID[]) {
  const setFetchKey = useSetAtom(queryFetchKey(gqlQuery));

  const invalidateQuery = useCallback(() => {
    console.log('invalidating query', { gqlQuery, dataIDs });
    setFetchKey((k) => k + 1);
  }, [dataIDs, gqlQuery, setFetchKey]);

  useSubscribeToInvalidationState(dataIDs, invalidateQuery);
}
