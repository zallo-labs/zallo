import { gql, useQuery } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { useSubgraphClient } from '@gql/GqlProvider';
import { UserSafesQuery, UserSafesQueryVariables } from '@gql/generated.sub';
import {
  toId,
  filterFirst,
  connectSafe,
  address,
  fixedWeightToPercent,
} from 'lib';
import { CombinedSafe, QUERY_SAFES_POLL_INTERVAL } from '.';

const SUB_QUERY = gql`
  query UserSafes($user: ID!) {
    user(id: $user) {
      id
      approvers {
        approverSet {
          group {
            safe {
              id
              impl {
                id
              }
              groups {
                id
                ref
                active
                approverSets(
                  first: 1
                  orderBy: blockHash
                  orderDirection: desc
                ) {
                  id
                  blockHash
                  timestamp
                  approvers {
                    user {
                      id
                    }
                    weight
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const useSubSafes = () => {
  const wallet = useWallet();

  const { data, ...rest } = useQuery<UserSafesQuery, UserSafesQueryVariables>(
    SUB_QUERY,
    {
      client: useSubgraphClient(),
      variables: { user: toId(wallet.address) },
      pollInterval: QUERY_SAFES_POLL_INTERVAL,
    },
  );

  const safes = filterFirst(
    data?.user?.approvers.map(
      ({
        approverSet: {
          group: { safe },
        },
      }) => safe,
    ) ?? [],
    (safe) => safe.id,
  );

  const combinedSafes: CombinedSafe[] = safes.map((s) => ({
    safe: connectSafe(s.id, wallet),
    impl: address(s.impl.id),
    name: '',
    groups: s.groups.map((g) => ({
      id: toId(g.id),
      ref: g.ref,
      active: g.active,
      name: '',
      approvers: g.approverSets[0].approvers.map((a) => ({
        addr: address(a.user.id),
        weight: fixedWeightToPercent(a.weight),
      })),
    })),
  }));

  return { data: combinedSafes, ...rest };
};
