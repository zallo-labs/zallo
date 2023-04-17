import { useTokensByValue } from '@token/useTokensByValue';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from '.';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';

export type TokensTabProps = TabNavigatorScreenProp<'Tokens'>;

export const TokensTab = withSuspense((_props: TokensTabProps) => {
  const account = useSelectedAccountId();
  const tokens = useTokensByValue(account);

  return (
    <FlashList
      data={tokens}
      renderItem={({ item }) => <TokenItem token={item.address} account={account} />}
      estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      showsVerticalScrollIndicator={false}
    />
  );
}, TabScreenSkeleton);
