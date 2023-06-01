import { Screen } from '~/components/layout/Screen';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { HomeAppbar } from './HomeAppbar';
import { QuickActions } from './QuickActions';
import { Tabs } from './Tabs';
import { Splash } from '~/components/Splash';
import { AccountValue } from './AccountValue';
import { Address } from 'lib';
import { useAccountIds } from '@api/account';

export interface HomeScreenParams {
  account?: Address;
}

export type HomeScreenProps = StackNavigatorScreenProps<'Home'>;

export const HomeScreen = withSuspense(({ route }: HomeScreenProps) => {
  const accounts = useAccountIds();
  const account = route.params?.account ?? accounts[0];

  return (
    <Screen>
      <HomeAppbar account={account} />

      <AccountValue account={account} />

      <QuickActions account={account} />

      <Tabs account={account} />
    </Screen>
  );
}, Splash);
