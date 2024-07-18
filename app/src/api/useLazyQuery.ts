import { useLazyLoadQuery } from 'react-relay';
import {
  GraphQLTaggedNode,
  OperationType,
  VariablesOf,
  getRequest,
  createOperationDescriptor,
} from 'relay-runtime';
import {
  useSetRequestLastFetched,
  useTtlFetchPolicy,
  useTtlLastUpdated,
} from './useTtlFetchPolicy';
import { useEffect } from 'react';

export type QueryOptions = Parameters<typeof useLazyLoadQuery>[2];

export function useLazyQuery<TQuery extends OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: VariablesOf<TQuery>,
  options?: QueryOptions,
): TQuery['response'] {
  const descriptor = createOperationDescriptor(
    getRequest(gqlQuery),
    variables,
    options?.networkCacheConfig,
  );
  const requestId = descriptor.request.identifier;

  const query = useLazyLoadQuery<TQuery>(gqlQuery, variables, {
    fetchPolicy: useTtlFetchPolicy(requestId),
    fetchKey: useTtlLastUpdated(),
    ...options,
  });
  console.log(useTtlFetchPolicy(requestId));

  const setLastFetched = useSetRequestLastFetched(requestId);
  useEffect(() => {
    // Query is only fetched once per mount of a unique request
    setLastFetched(Date.now());
  }, [setLastFetched, requestId]);

  return query;
}
