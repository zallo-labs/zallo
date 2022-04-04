import { useQuery } from '@apollo/client';

import { Approver, ArrVal, connectSafe, filterUnique, Safe } from 'lib';
import { BytesLike, Signer } from '@features/ethers';
import { useWallet } from '@features/wallet/wallet.provider';
import { GetApiSafes, GetApiSafesVariables } from '@gql/apiTypes';
import { GetSgSafes, GetSgSafesVariables } from '@gql/subgraphTypes';
import { sgGql, SG_CLIENT, apiGql, API_CLIENT } from '@gql/clients';
import { combineRest, combine, simpleKeyExtractor } from '@gql/combine';

const SG_QUERY = sgGql`
query GetSgSafes($approver: ID!) {
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

const useSgSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<GetSgSafes, GetSgSafesVariables>(SG_QUERY, {
    client: SG_CLIENT,
    variables: { approver: wallet.address },
  });

  const safes = data?.approver?.groups.map((g) => g.group.safe) ?? [];

  return { data: filterUnique(safes, (safe) => safe.id), ...rest };
};

export const API_SAFE_FIELDS = apiGql`
fragment SafeFields on Safe {
  id
  isCf
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

  const { data, ...rest } = useQuery<GetApiSafes, GetApiSafesVariables>(API_QUERY, {
    client: API_CLIENT,
    variables: { approver: wallet.address },
  });

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
  contract: Safe;
  isCf: boolean;
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
    contract: connectSafe(apiSafe.id, wallet),
    isCf: apiSafe.isCf,
    deploySalt: apiSafe.deploySalt,
    groups,
  };
};

export const useSafes = () => {
  const wallet = useWallet();

  const { data: sgSafes, ...sgRest } = useSgSafes();
  const { data: apiSafes, ...apiRest } = useApiSafes();

  const rest = combineRest(sgRest, apiRest);

  if (rest.loading && !rest.error) return { safes: undefined, ...rest };

  const safes = apiSafes
    ? combine(sgSafes, apiSafes, simpleKeyExtractor('id'), {
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
            groups: filterUnique(subGroups.concat(apiSafeData.groups), (g) => g.id),
          };
        },
      })
    : undefined;

  return { safes, ...rest };
};
