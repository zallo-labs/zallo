import { useRouter } from 'expo-router';
import { UAddress } from 'lib';
import { useCallback } from 'react';
import { useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { useFocusEffect } from 'expo-router';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { createStyles } from '@theme/styles';
import { View } from 'react-native';
import { OnboardProgress } from '#/onboard/OnboardProgress';
import { Appbar } from '#/Appbar/Appbar';
import { CreateAccount } from '#/CreateAccount';
import { withSuspense } from '#/skeleton/withSuspense';
import { OnboardMainPane } from '#/onboard/OnboardMainPane';
import { graphql } from 'react-relay';
import { account_AccountOnboardingQuery } from '~/api/__generated__/account_AccountOnboardingQuery.graphql';
import { useLazyQuery } from '~/api';

const Query = graphql`
  query account_AccountOnboardingQuery {
    accounts {
      id
      address
    }
  }
`;

function AccountOnboardingScreen() {
  const router = useRouter();
  const setSelected = useSetSelectedAccont();

  const { accounts } = useLazyQuery<account_AccountOnboardingQuery>(Query, {});

  const next = useCallback(
    (account: UAddress) => {
      setSelected(account);
      router.push({ pathname: '/(nav)/[account]/(home)/', params: { account } });
    },
    [router, setSelected],
  );

  useFocusEffect(() => {
    if (accounts.length) next(accounts[0].address);
  });

  if (accounts.length) return null;

  return (
    <OnboardMainPane contentContainerStyle={styles.pane} stickyHeaderIndices={[0]}>
      <View>
        <OnboardProgress progress={0.8} />
        <Appbar mode="large" headline="Let's setup your account" inset={false} />
      </View>

      <CreateAccount onCreate={next} />
    </OnboardMainPane>
  );
}

const styles = createStyles({
  pane: {
    flexGrow: 1,
    gap: 8,
  },
});

export default withSuspense(AccountOnboardingScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
