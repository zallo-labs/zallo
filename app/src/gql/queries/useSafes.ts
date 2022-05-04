import { useQuery } from '@apollo/client';
import { BytesLike, Signer } from 'ethers';

import { Approver, ArrVal, filterUnique, Safe, getSafe } from 'lib';
import { useWallet } from '@features/wallet/WalletProvider';
import { GetApiSafes, GetApiSafesVariables } from '@gql/api.generated';
import { GetSubSafes, GetSubSafesVariables } from '@gql/subgraph.generated';
import { subGql, apiGql } from '@gql/clients';
import { combineRest, combine, simpleKeyExtractor } from '@gql/combine';
import { useApiClient, useSubgraphClient } from '@gql/GqlProvider';

const SUB_QUERY = subGql`
query GetSubSafes($approver: ID!) {
  approver(id: $approver) {
    groups {
      group {
        safe {
          id
          groups {
            id
            hash
            active
            approvers {
              id
              weight
            }
          }
        }
      }
    }
  }
}
`;

const useSubSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<GetSubSafes, GetSubSafesVariables>(
    SUB_QUERY,
    {
      client: useSubgraphClient(),
      variables: { approver: wallet.address.toLowerCase() },
    },
  );

  const safes = data?.approver?.groups.map((g) => g.group.safe) ?? [];

  return { data: filterUnique(safes, (safe) => safe.id), ...rest };
};

export const API_SAFE_FIELDS = apiGql`
fragment SafeFields on Safe {
  id
  name
  deploySalt
  groups {
    id
    hash
    approvers {
      approverId
      weight
    }
  }
}
`;

const API_QUERY = apiGql`
${API_SAFE_FIELDS}
query GetApiSafes($approver: String!) {
  approver(where: { id: $approver }) {
    safes {
      ...SafeFields
    }
  }
}
`;

const useApiSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<GetApiSafes, GetApiSafesVariables>(
    API_QUERY,
    {
      client: useApiClient(),
      variables: { approver: wallet.address },
      fetchPolicy: 'cache-and-network',
    },
  );

  return { data: data?.approver?.safes ?? [], ...rest };
};

export interface Group {
  id: string;
  hash: BytesLike;
  active: boolean;
  approvers: Approver[];
}

export interface SafeData {
  id: string;
  safe: Safe;
  name?: string;
  deploySalt?: BytesLike;
  groups: Group[];
}

export const apiSafeToSafeData = (
  apiSafe: ArrVal<ReturnType<typeof useApiSafes>['data']>,
  wallet: Signer,
): SafeData => {
  const groups: Group[] =
    apiSafe.groups?.map((g) => ({
      id: g.id,
      hash: g.hash,
      active: true,
      approvers:
        g.approvers?.map((g) => ({
          addr: g.approverId,
          weight: g.weight,
        })) ?? [],
    })) ?? [];

  return {
    id: apiSafe.id,
    safe: getSafe(apiSafe.id, wallet),
    name: apiSafe.name,
    deploySalt: apiSafe.deploySalt,
    groups,
  };
};

export const useSafes = () => {
  const wallet = useWallet();

  const { data: subSafes, ...subRest } = useSubSafes();
  const { data: apiSafes, ...apiRest } = useApiSafes();

  const rest = combineRest(subRest, apiRest);

  if (rest.loading && !rest.error) return { safes: undefined, ...rest };

  const safes = apiSafes
    ? combine(subSafes, apiSafes, simpleKeyExtractor('id'), {
        atLeastApi: (subSafe, apiSafe): SafeData => {
          const subGroups: Group[] =
            subSafe?.groups.map((g) => ({
              id: g.id,
              hash: g.hash,
              active: g.active,
              approvers: g.approvers.map((a) => ({
                addr: a.id,
                weight: a.weight,
              })),
            })) ?? [];

          const apiSafeData = apiSafeToSafeData(apiSafe, wallet);

          return {
            ...apiSafeData,
            groups: filterUnique(
              subGroups.concat(apiSafeData.groups),
              (g) => g.id,
            ),
          };
        },
      })
    : undefined;

  return { safes, ...rest };
};
