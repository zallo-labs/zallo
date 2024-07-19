import { showError } from '#/provider/SnackbarProvider';
import { useRouter } from 'expo-router';
import { PolicyKey, UAddress } from 'lib';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemovePolicyMutation } from '~/api/__generated__/useRemovePolicyMutation.graphql';

export function useRemovePolicy() {
  const router = useRouter();

  const commit = useMutation<useRemovePolicyMutation>(graphql`
    mutation useRemovePolicyMutation($account: UAddress!, $key: PolicyKey!) {
      removePolicy(input: { account: $account, key: $key }) {
        id
        draft {
          id
          proposal {
            id
          }
        }
      }
    }
  `);

  return async (account: UAddress, key: PolicyKey) => {
    const r = await commit({ account, key });
    const proposal = r.removePolicy.draft?.proposal;

    if (proposal) {
      router.push({
        pathname: `/(nav)/transaction/[id]`,
        params: { id: proposal.id },
      });
    } else {
      showError('Something went wrong removing policy', { event: { response: r } });
    }
  };
}
