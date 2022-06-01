import { useMutation } from '@apollo/client';
import { useExecute } from '@features/execute/useExecute';
import { createSt } from '@features/execute/util';
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
import { API_GROUP_FIELDS_FRAGMENT, CombinedGroup } from '@queries';
import { ethers } from 'ethers';
import { Group, hashGroup, isPresent, toSafeGroup } from 'lib';

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

const useUpsertApiGroup = () => {
  const { safe } = useSafe();
  const isDeployed = useIsDeployed();
  const wallet = useWallet();

  const [mutation] = useMutation<UpsertGroup, UpsertGroupVariables>(
    API_MUTATION,
    {
      client: useApiClient(),
    },
  );

  const upsert = (cur: CombinedGroup, prev?: CombinedGroup) => {
    // Ensure cur hash & id are up to date
    cur.hash = hashGroup(cur);

    const groupHash = ethers.utils.hexlify(prev?.hash ?? cur.hash);

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
          hash: cur.hash,
          approvers,
          safe: {
            connectOrCreate: {
              where: { id: safe.address },
              create: { id: safe.address },
            },
          },
        },
        update: {
          ...(cur.hash !== prev?.hash && { hash: { set: cur.hash } }),
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

const useSafeUpsert = () => {
  const { safe } = useSafe();
  const execute = useExecute();

  const upsert = async (cur: Group, prev?: Group) => {
    if (prev && hashGroup(prev) === hashGroup(cur)) return;

    const addGroupSt = createSt({
      to: safe.address,
      data: safe.interface.encodeFunctionData('addGroup', [
        toSafeGroup(cur).approvers,
      ]),
    });

    const rmGroupSt = prev
      ? createSt({
          to: safe.address,
          data: safe.interface.encodeFunctionData('removeGroup', [
            hashGroup(prev),
          ]),
        })
      : undefined;

    await execute(...[addGroupSt, rmGroupSt].filter(isPresent));
  };

  return upsert;
};

export const useUpsertGroup = () => {
  const upsertApiGroup = useUpsertApiGroup();
  const upsertSafeGroup = useSafeUpsert();

  const upsert = async (cur: CombinedGroup, prev?: CombinedGroup) => {
    await upsertSafeGroup(cur, prev);
    await upsertApiGroup(cur, prev);

    // TODO: update cache
  };

  return upsert;
};
