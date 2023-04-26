import { useTokensByValue } from '@token/useTokensByValue';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from '.';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { StyleSheet } from 'react-native';

export type TokensTabProps = TabNavigatorScreenProp<'Tokens'>;

export const TokensTab = withSuspense(
  (_props: TokensTabProps) => {
    const account = useSelectedAccountId();
    const tokens = useTokensByValue(account);

    return (
      <FlashList
        data={tokens}
        renderItem={({ item }) => <TokenItem token={item.address} account={account} />}
        contentContainerStyle={styles.contentContainer}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        showsVerticalScrollIndicator={false}
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
});
