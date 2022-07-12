import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useIsDeployed } from '@features/safe/useIsDeployed';
import {
  AQueryUserSafes,
  UpsertGroup,
  UpsertGroupVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import produce from 'immer';
import { useWallet } from '@features/wallet/useWallet';
import { toId } from 'lib';
import {
  API_GROUP_FIELDS_FRAGMENT,
  CombinedGroup,
  AQUERY_USER_SAFES,
} from '~/queries/useSafes';

const API_MUTATION = apiGql`
${API_GROUP_FIELDS_FRAGMENT}

mutation UpsertGroup($safe: Address!, $group: GroupInput!) {
  upsertGroup(safe: $safe, group: $group) {
    ...GroupFields
  }
}
`;

export const useUpsertApiGroup = () => {
  const wallet = useWallet();
  const { safe } = useSafe();
  const isDeployed = useIsDeployed();

  const [mutation] = useMutation<UpsertGroup, UpsertGroupVariables>(
    API_MUTATION,
    { client: useApiClient() },
  );

  const upsert = (g: CombinedGroup) => {
    return mutation({
      variables: {
        safe: safe.address,
        group: {
          ref: g.ref,
          name: g.name,
          // Only maintain a list of approvers if the safe is counterfactual
          approvers: isDeployed ? [] : g.approvers,
        },
      },
      optimisticResponse: {
        upsertGroup: {
          __typename: 'Group',
          id: g.id,
          ref: g.ref,
          safeId: safe.address,
          approvers: g.approvers.map((a) => ({
            __typename: 'Approver',
            userId: a.addr,
            weight: a.weight,
          })),
          name: g.name,
        },
      },
      update: (cache, { data: { upsertGroup } }) => {
        const opts: QueryOpts<never> = {
          query: AQUERY_USER_SAFES,
        };

        const data = cache.readQuery<AQueryUserSafes>(opts);

        cache.writeQuery<AQueryUserSafes>({
          ...opts,
          overwrite: true,
          data: produce(data, (data) => {
            if (!data) {
              data = {
                user: {
                  __typename: 'User',
                  id: wallet.address,
                  safes: [],
                },
              };
            }

            const safeId = toId(safe.address);
            const safeIndex = data.user.safes.findIndex((s) => s.id === safeId);

            if (safeIndex >= 0) {
              const groupIndex = data.user.safes[safeIndex].groups.findIndex(
                (g) => g.id === upsertGroup.id,
              );
              if (groupIndex >= 0) {
                data.user.safes[safeIndex].groups[groupIndex] = upsertGroup;
              } else {
                data.user.safes[safeIndex].groups.push(upsertGroup);
              }
            } else {
              data.user.safes.push({
                __typename: 'Safe',
                id: toId(safe.address),
                deploySalt: '',
                name: '',
                groups: [upsertGroup],
              });
            }
          }),
        });
      },
    });
  };

  return upsert;
};
