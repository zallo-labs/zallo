import { useRelayEnvironment } from 'react-relay';
import {
  GraphQLTaggedNode,
  MutationConfig,
  MutationParameters,
  commitMutation,
} from 'relay-runtime';
import { Headers, withHeaders } from './network/auth';
import { useCallback } from 'react';

export interface UseMutationOptions<TOperation extends MutationParameters>
  extends Pick<
    MutationConfig<TOperation>,
    'updater' | 'optimisticResponse' | 'optimisticUpdater'
  > {}

interface MutateOptions<TOperation extends MutationParameters>
  extends Omit<MutationConfig<TOperation>, 'mutation' | 'variables'> {
  headers?: Headers;
}

export function useMutation<TOperation extends MutationParameters>(
  mutation: GraphQLTaggedNode,
  params: UseMutationOptions<TOperation> = {},
) {
  const environment = useRelayEnvironment();

  return useCallback(
    (variables: TOperation['variables'], opts: MutateOptions<TOperation> = {}) => {
      const overrides = { ...params, ...opts };

      return new Promise<TOperation['response']>((resolve, reject) =>
        commitMutation(environment, {
          mutation,
          variables,
          onCompleted: (response) => resolve(response),
          onError: (error) => reject(error),
          ...overrides,
          ...(opts.headers && {
            cacheConfig: withHeaders(opts.headers, overrides.cacheConfig),
          }),
        }),
      );
    },
    [environment, mutation, params],
  );
}
