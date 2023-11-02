import { gql } from '@api';
import { useRouter } from 'expo-router';
import { Address } from 'lib';
import { useEffect } from 'react';
import CreateAccountScreen from '~/app/(drawer)/accounts/create';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { useSetSelectedAccont } from '~/hooks/useSelectedAccount';

const Query = gql(/* GraphQL */ `
  query AccountOnboarding {
    accounts {
      id
      address
    }
  }
`);

function AccountOnboardingScreen() {
  const router = useRouter();
  const setSelected = useSetSelectedAccont();

  const { accounts } = useQuery(Query).data;

  const next = (account: Address) => {
    setSelected(account);
    router.push(`/onboard/(drawer)/auth`);
  };

  useEffect(() => {
    if (accounts.length) next(accounts[0].address);
  }, [accounts]);

  return <CreateAccountScreen onCreate={next} />;
}

export default withSuspense(AccountOnboardingScreen, <ScreenSkeleton />);
