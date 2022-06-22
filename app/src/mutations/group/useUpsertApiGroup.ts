import { useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useIsDeployed } from '@features/safe/useIsDeployed';
import {
  AQueryUserSafes,
  AQueryUserSafesVariables,
  UpsertGroup,
  UpsertGroupVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { address } from 'lib';
import {
  API_GROUP_FIELDS_FRAGMENT,
  AQUERY_USER_SAFES,
  CombinedGroup,
  useSubSafes,
} from '~/queries';

const API_MUTATION = apiGql`
${API_GROUP_FIELDS_FRAGMENT}

mutation UpsertGroup($safe: Address!, $group: GroupInput!) {
  upsertGroup(safe: $safe, group: $group) {
    ...GroupFields
  }
}
`;

export const useUpsertApiGroup = () => {
  const { safe } = useSafe();
  const { data: subSafes } = useSubSafes();
  const isDeployed = useIsDeployed();

  const subSafeIds = subSafes.map((s) => address(s.id));

  const [mutation] = useMutation<UpsertGroup, UpsertGroupVariables>(
    API_MUTATION,
    { client: useApiClient() },
  );

  const upsert = (g: CombinedGroup) => {
    // Only maintain a list of approvers if the safe is counterfactual
    const approvers = isDeployed ? [] : g.approvers;

    return mutation({
      variables: {
        safe: safe.address,
        group: {
          ...g,
          approvers,
        },
      },
      optimisticResponse: {
        upsertGroup: {
          __typename: 'Group',
          id: g.id,
          ref: g.ref,
          safeId: safe.address,
          approvers: approvers.map((a) => ({
            __typename: 'Approver',
            userId: a.addr,
            weight: a.weight,
          })),
          name: g.name,
        },
      },
      update: (cache, { data: { upsertGroup } }) => {
        const opts: QueryOpts<AQueryUserSafesVariables> = {
          query: AQUERY_USER_SAFES,
          variables: { safes: subSafeIds },
        };

        const data = cache.readQuery<AQueryUserSafes, AQueryUserSafesVariables>(
          opts,
        );

        cache.writeQuery<AQueryUserSafes, AQueryUserSafesVariables>({
          ...opts,
          overwrite: true,
          data: {
            ...data,
            safes: data.safes.map((s) => {
              if (s.id !== safe.address) return s;

              const groupsExc = s.groups.filter((g) => g.id !== upsertGroup.id);

              return {
                ...s,
                groups: [...groupsExc, upsertGroup],
              };
            }),
          },
        });
      },
    });
  };

  return upsert;
};
