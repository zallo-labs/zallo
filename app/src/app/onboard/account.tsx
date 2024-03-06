import { gql } from '@api';
import { useRouter } from 'expo-router';
import { UAddress } from 'lib';
import { useCallback, useEffect } from 'react';
import CreateAccountScreen from '~/app/(drawer)/accounts/create';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { useRootNavigationState } from 'expo-router';

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

  const next = useCallback(
    (account: UAddress) => {
      setSelected(account);
      router.push(`/onboard/auth`);
    },
    [router, setSelected],
  );

  const navMounted = !!useRootNavigationState().key;
  useEffect(() => {
    if (accounts.length && navMounted) next(accounts[0].address);
  }, [accounts, navMounted, next]);

  return <CreateAccountScreen onCreate={next} />;
}

export default withSuspense(AccountOnboardingScreen, <ScreenSkeleton />);
