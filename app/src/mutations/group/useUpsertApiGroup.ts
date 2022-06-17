import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useIsDeployed } from '@features/safe/useIsDeployed';
import { useWallet } from '@features/wallet/useWallet';
import {
  GroupApproverUpdateManyWithoutGroupInput,
  UpsertGroup,
  UpsertGroupVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { API_GROUP_FIELDS_FRAGMENT, CombinedGroup } from '~/queries';
import { hashGroup } from 'lib';
import { hexlify } from 'ethers/lib/utils';

const API_MUTATION = apiGql`
${API_GROUP_FIELDS_FRAGMENT}

mutation UpsertGroup(
  $where: GroupWhereUniqueInput!
  $create: GroupCreateInput!
  $update: GroupUpdateInput!
) {
  upsertGroup(where: $where, create: $create, update: $update) {
    ...GroupFields
  }
}
`;

export const useUpsertApiGroup = () => {
  const { safe } = useSafe();
  const isDeployed = useIsDeployed();
  const wallet = useWallet();

  const [mutation] = useMutation<UpsertGroup, UpsertGroupVariables>(
    API_MUTATION,
    { client: useApiClient() },
  );

  const upsert = (cur: CombinedGroup, prev?: CombinedGroup) => {
    // Ensure cur hash & id are up to date
    cur.hash = hashGroup(cur);

    const groupHash = hexlify(prev?.hash ?? cur.hash);

    // Only maintain a list of approvers if the safe is counterfactual
    const approvers: GroupApproverUpdateManyWithoutGroupInput = !isDeployed
      ? {
          upsert: cur.approvers.map((a) => ({
            where: {
              safeId_groupHash_approverId: {
                safeId: safe.address,
                approverId: wallet.address,
                groupHash,
              },
            },
            create: {
              approver: {
                connectOrCreate: {
                  where: { id: a.addr },
                  create: { id: a.addr },
                },
              },
              weight: a.weight,
            },
            update: {
              approver: {
                connectOrCreate: {
                  where: { id: a.addr },
                  create: { id: a.addr },
                },
              },
              weight: { set: a.weight },
            },
          })),
        }
      : undefined;

    return mutation({
      variables: {
        where: {
          safeId_hash: {
            safeId: safe.address,
            hash: groupHash,
          },
        },
        create: {
          name: cur.name,
          hash: hexlify(cur.hash),
          approvers,
          safe: {
            connectOrCreate: {
              where: { id: safe.address },
              create: { id: safe.address },
            },
          },
        },
        update: {
          ...(cur.hash !== prev?.hash && {
            hash: { set: hexlify(cur.hash) },
          }),
          ...(approvers !== prev?.approvers && {
            approvers: approvers ?? { set: [] },
          }),
          ...(cur.name !== prev?.name && { name: { set: cur.name } }),
        },
      },
    });
  };

  return upsert;
};
