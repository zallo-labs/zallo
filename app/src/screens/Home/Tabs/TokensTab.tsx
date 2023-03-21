import { useTokensByValue } from '@token/useTokensByValue';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from '.';
import { StyleSheet } from 'react-native';

export type TokensTabProps = TabNavigatorScreenProp<'Tokens'>;

export const TokensTab = (_props: TokensTabProps) => {
  const account = useSelectedAccountId();
  const tokens = useTokensByValue(account);

  return (
    <FlashList
      data={tokens}
      renderItem={({ item }) => <TokenItem token={item} account={account} />}
      estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});
