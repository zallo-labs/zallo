import { Token } from '@token/token';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';
import { StyleProp, ViewStyle } from 'react-native';
import { useSelectedAccountId } from '../account2/useSelectedAccount';
import { FiatValue } from '../fiat/FiatValue';
import { ItemSkeleton } from '../item/ItemSkeleton';
import { ListItem } from '../list/ListItem';
import { withSkeleton } from '../skeleton/withSkeleton';
import { TokenAmount } from './TokenAmount';
import { TokenIcon } from './TokenIcon/TokenIcon';

export interface TokenItemProps {
  token: Token;
  amount?: bigint;
  style?: StyleProp<ViewStyle>;
}

export const TokenItem = ({ token, amount, style }: TokenItemProps) => {
  const balance = useTokenBalance(token, useSelectedAccountId());
  if (!amount) amount = balance;

  return (
    <ListItem
      leading={(props) => <TokenIcon token={token} {...props} />}
      headline={token.name}
      supporting={<TokenAmount token={token} amount={amount} />}
      trailing={({ Text }) => (
        <Text variant="labelLarge">
          <FiatValue value={useTokenValue(token, amount)} />
        </Text>
      )}
      style={style}
    />
  );
};

export default TokenItem;
