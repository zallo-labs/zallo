import { useTokensWithBalanceByValue } from '@token/useTokensWithBalanceByValue';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from '.';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Address } from 'lib';

export interface TokensTabParams {
  account: Address;
}

export type TokensTabProps = TabNavigatorScreenProp<'Tokens'>;

export const TokensTab = withSuspense(
  ({ route }: TokensTabProps) => {
    const { account } = route.params;
    const tokens = useTokensWithBalanceByValue(account);

    return (
      <FlashList
        data={tokens}
        renderItem={({ item }) => <TokenItem token={item.address} account={account} />}
        contentContainerStyle={styles.contentContainer}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text variant="titleMedium" style={styles.emptyText}>
            You have no tokens{'\n'}
            Receive tokens to get started
          </Text>
        }
      />
    );
  },
  (props) => (
    <TabScreenSkeleton {...props} listItems={{ leading: true, supporting: true, trailing: true }} />
  ),
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    margin: 16,
    textAlign: 'center',
  },
});
