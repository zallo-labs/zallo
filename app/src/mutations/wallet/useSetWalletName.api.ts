import { gql } from '@apollo/client';
import { useSetWalletNameMutation } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { useCallback } from 'react';
import { CombinedWallet } from '~/queries/wallets';
import { API_WALLET_FIELDS } from '~/queries/wallets/useWallets.api';
import { updateApiUserWalletsCache } from './useSetWalletQuorums.api';

const QUERY = gql`
  ${API_WALLET_FIELDS}

  mutation SetWalletName($id: WalletId!, $name: String!) {
    setWalletName(id: $id, name: $name) {
      ...WalletFields
    }
  }
`;

export const useSetWalletName = () => {
  const [mutate] = useSetWalletNameMutation({ client: useApiClient() });

  return useCallback(
    ({ id, accountAddr, ref, name, quorums }: CombinedWallet) => {
      return mutate({
        variables: {
          id: { accountId: accountAddr, ref },
          name,
        },
        optimisticResponse: {
          setWalletName: {
            __typename: 'Wallet',
            id,
            accountId: accountAddr,
            ref,
            name,
            quorums: quorums.map((quorum) => ({
              __typename: 'Quorum',
              approvers: quorum.approvers.map((approver) => ({
                __typename: 'Approver',
                userId: approver,
              })),
            })),
          },
        },
        update: (cache, result) => {
          const acc = result.data?.setWalletName;
          if (acc) updateApiUserWalletsCache(cache, [acc]);
        },
      });
    },
    [mutate],
  );
};
