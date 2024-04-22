import { gql } from '@api';
import { useRouter } from 'expo-router';
import { UAddress } from 'lib';
import { useCallback } from 'react';
import CreateAccountScreen from '~/app/(drawer)/accounts/create';
import { useQuery } from '~/gql';
import { useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { useFocusEffect } from 'expo-router';
import { LinkZalloButton } from '#/link/LinkZalloButton';
import { LinkLedgerButton } from '#/link/ledger/LinkLedgerButton';
import { LinkGoogleButton } from '#/link/LinkGoogleButton';
import { LinkAppleButton } from '#/link/LinkAppleButton';

const Query = gql(/* GraphQL */ `
  query AccountOnboarding {
    accounts {
      id
      address
    }

    user {
      id
      ...LinkAppleButton_User
      ...LinkGoogleButton_User
    }
  }
`);

function AccountOnboardingScreen() {
  const router = useRouter();
  const setSelected = useSetSelectedAccont();

  const { accounts, user } = useQuery(Query).data;

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

  return (
    <CreateAccountScreen
      onCreate={next}
      actions={
        <>
          <LinkZalloButton />
          <LinkLedgerButton />
          <LinkGoogleButton user={user} />
          <LinkAppleButton user={user} />
        </>
      }
    />
  );
}

export default AccountOnboardingScreen;

export { ErrorBoundary } from '#/ErrorBoundary';
