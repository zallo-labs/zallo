import { Redirect } from 'expo-router';

import { useQuery } from '~/gql';
import { gql } from '~/gql/api';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';

const Query = gql(/* GraphQL */ `
  query RootScreen {
    accounts {
      id
      address
    }
  }
`);

export default function RootScreen() {
  const selectedAccount = useSelectedAccount();
  const accounts = useQuery(Query).data?.accounts ?? [];

  return accounts.length ? (
    <Redirect
      href={{
        pathname: `/(drawer)/[account]/(home)/`,
        params: {
          account:
            accounts.find((a) => a.address === selectedAccount)?.address ?? accounts[0].address,
        },
      }}
    />
  ) : (
    <Redirect href={`/onboard/landing`} />
  );
}
