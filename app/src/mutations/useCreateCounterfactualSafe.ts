
import { useCallback, useMemo } from 'react';
import { useMutation } from '@apollo/client';

import { useWallet } from '@features/wallet/useWallet';
import {
  API_SAFE_FIELDS_FRAGMENT,
  AQUERY_USER_SAFES,
  useSubSafes,
} from '~/queries';
import {
  AQueryUserSafes,
  AQueryUserSafesVariables,
  UpsertCounterfactualSafe,
  UpsertCounterfactualSafeVariables,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import {
  address,
  calculateSafeAddress,
  getGroupId,
  Group,
  PERCENT_THRESHOLD,
  randomGroupRef,
  toId,
  toSafeConstructorDeployArgs,
} from 'lib';
import { hexlify } from 'ethers/lib/utils';
import { QueryOpts } from '@gql/update';
import { useSafeFactory } from '@features/safe/useSafeFactory';

const API_MUTATION = apiGql`
${API_SAFE_FIELDS_FRAGMENT}

mutation UpsertCounterfactualSafe($safe: Address!, $salt: Bytes32!, $group: GroupInput!) {
    upsertCounterfactualSafe(safe: $safe, salt: $salt, group: $group) {
      ...SafeFields
    }
}
`;

export const useCreateCounterfactualSafe = () => {
  const wallet = useWallet();
  const factory = useSafeFactory();
  const { data: subSafes } = useSubSafes();

  const subSafeIds = useMemo(
    () => subSafes.map((s) => address(s.id)),
    [subSafes],
  );

  const [mutation] = useMutation<
    UpsertCounterfactualSafe,
    UpsertCounterfactualSafeVariables
  >(API_MUTATION, { client: useApiClient() });

  const create = useCallback(async () => {
    const group: Group = {
      ref: randomGroupRef(),
      approvers: [{ addr: wallet.address, weight: PERCENT_THRESHOLD }],
    };

    const { addr: safe, salt } = await calculateSafeAddress(
      toSafeConstructorDeployArgs({ group }),
      factory,
    );

    await mutation({
      variables: { safe, salt, group },
      optimisticResponse: {
        upsertCounterfactualSafe: {
          __typename: 'Safe',
          id: toId(safe),
          name: null,
          deploySalt: salt,
          groups: [
            {
              __typename: 'Group',
              id: getGroupId(safe, group.ref),
              ref: hexlify(group.ref),
              safeId: safe,
              name: null,
              approvers: [],
            },
          ],
        },
      },
      update: (cache, { data: { upsertCounterfactualSafe: safe } }) => {
        const opts: QueryOpts<AQueryUserSafesVariables> = {
          query: AQUERY_USER_SAFES,
          variables: { safes: subSafeIds },
        };

        const data = cache.readQuery<AQueryUserSafes, AQueryUserSafesVariables>(
          opts,
        );

        if (!data.user.safes.find((s) => s.id === safe.id)) {
          cache.writeQuery<AQueryUserSafes, AQueryUserSafesVariables>({
            ...opts,
            data: {
              ...data,
              user: {
                ...data.user,
                safes: [...data.user.safes, safe],
              },
            },
          });
        }
      },
    });

    return safe;
  }, [factory, mutation, subSafeIds, wallet.address]);

  return create;
};
