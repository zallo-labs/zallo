import { useRelayEnvironment } from 'react-relay';
import {
  GraphQLTaggedNode,
  MutationConfig,
  MutationParameters,
  commitMutation,
} from 'relay-runtime';
import { AuthToken, setRequestAuthToken } from './auth-manager';

export interface UseMutationOptions<TOperation extends MutationParameters>
  extends Pick<
    MutationConfig<TOperation>,
    'updater' | 'optimisticResponse' | 'optimisticUpdater'
  > {}

interface MutateOptions<TOperation extends MutationParameters>
  extends Omit<MutationConfig<TOperation>, 'mutation' | 'variables'> {
  authToken?: AuthToken;
}

export function useMutation<TOperation extends MutationParameters>(
  mutation: GraphQLTaggedNode,
  params: UseMutationOptions<TOperation> = {},
) {
  const environment = useRelayEnvironment();

  return (variables: TOperation['variables'], opts: MutateOptions<TOperation> = {}) => {
    if (opts.authToken) setRequestAuthToken(variables, opts.authToken);

    return new Promise<TOperation['response']>((resolve, reject) =>
      commitMutation(environment, {
        mutation,
        variables,
        onCompleted: (response) => resolve(response),
        onError: (error) => reject(error),
        ...params,
        ...opts,
      }),
    );
  };
}
