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

export function useMutation<TOperation extends MutationParameters>(
  mutation: GraphQLTaggedNode,
  params: UseMutationOptions<TOperation> = {},
) {
  const environment = useRelayEnvironment();

  return (variables: TOperation['variables'], authToken?: AuthToken) => {
    if (authToken) setRequestAuthToken(variables, authToken);

    return new Promise<TOperation['response']>((resolve, reject) =>
      commitMutation(environment, {
        mutation,
        variables,
        ...params,
        onCompleted: (response) => resolve(response),
        onError: (error) => reject(error),
      }),
    );
  };
}
