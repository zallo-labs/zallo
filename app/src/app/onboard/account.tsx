import { gql } from '@api';
import { useRouter } from 'expo-router';
import { UAddress } from 'lib';
import { useCallback } from 'react';
import CreateAccountScreen from '~/app/(drawer)/accounts/create';
import { useQuery } from '~/gql';
import { useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { useFocusEffect } from 'expo-router';

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

  useFocusEffect(() => {
    if (accounts.length) next(accounts[0].address);
  });

  if (accounts.length) return null;

  return <CreateAccountScreen onCreate={next} />;
}

export default AccountOnboardingScreen;
