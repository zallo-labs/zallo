import { useTokensByValue } from '@token/useTokensByValue';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from '.';

export type TokensTabProps = TabNavigatorScreenProp<'Tokens'>;

export const TokensTab = (_props: TokensTabProps) => {
  const account = useSelectedAccountId();
  const tokens = useTokensByValue(account);

  return (
    <FlashList
      data={tokens}
      renderItem={({ item }) => <TokenItem token={item} account={account} />}
      estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      showsVerticalScrollIndicator={false}
    />
  );
};
