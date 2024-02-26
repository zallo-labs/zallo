import { Redirect } from 'expo-router';
import { useQuery } from '~/gql';
import { gql } from '@api';
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
  const query = useQuery(Query);
  const accounts = query.data?.accounts;

  return accounts?.length && !query.fetching ? (
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
    <Redirect href={`/hello`} />
  );
}
