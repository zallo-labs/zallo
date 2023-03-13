import { Token } from '@token/token';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { withSkeleton } from '../skeleton/withSkeleton';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';
import TokenIcon from './TokenIcon/TokenIcon';
import { Text } from 'react-native-paper';
import { TokenAmount } from './TokenAmount';
import { FiatValue } from '../fiat/FiatValue';
import { AccountIdlike } from '@api/account';

export interface TokenBalanceCardProps extends CardItemProps {
  token: Token;
  account: AccountIdlike;
}

export const TokenBalanceCard = withSkeleton(
  ({ token, account, ...itemProps }: TokenBalanceCardProps) => {
    const balance = useTokenBalance(token, account);

    return (
      <CardItem
        Left={<TokenIcon token={token} />}
        Main={[
          <Text variant="titleMedium">{token.name}</Text>,
          <Text variant="bodyMedium">Balance</Text>,
        ]}
        Right={[
          <Text variant="titleSmall">
            <FiatValue value={useTokenValue(token, balance)} />
          </Text>,
          <Text variant="bodyMedium">
            <TokenAmount token={token} amount={balance} />
          </Text>,
        ]}
        {...itemProps}
      />
    );
  },
  CardItemSkeleton,
);
