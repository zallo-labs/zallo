import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { Screen } from '~/components/layout/Screen';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { HomeAppbar } from './HomeAppbar';
import { QuickActions } from './QuickActions';
import { Tabs } from './Tabs';
import { Splash } from '~/components/Splash';
import { AccountValue } from './AccountValue';

export type HomeScreenProps = StackNavigatorScreenProps<'Home'>;

export const HomeScreen = withSuspense((_props: HomeScreenProps) => {
  const account = useSelectedAccountId();

  return (
    <Screen>
      <HomeAppbar />

      <AccountValue account={account} />

      <QuickActions />

      <Tabs />
    </Screen>
  );
}, Splash);
