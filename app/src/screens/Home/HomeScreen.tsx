import { useTotalValue } from '@token/useTotalValue';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { Appbar } from './Appbar';
import { QuickActions } from './QuickActions';
import { TabNavigator } from './Tabs';

export type HomeScreenProps = StackNavigatorScreenProps<'Home'>;

export const HomeScreen = withSuspense((_props: HomeScreenProps) => {
  const account = useSelectedAccountId();

  return (
    <Screen withoutTopInset>
      <Appbar />

      <Text variant="displayMedium" style={styles.totalValue}>
        <FiatValue value={useTotalValue(account)} />
      </Text>

      <QuickActions />

      <TabNavigator />
    </Screen>
  );
}, ScreenSkeleton);

const styles = StyleSheet.create({
  totalValue: {
    margin: 16,
  },
});
