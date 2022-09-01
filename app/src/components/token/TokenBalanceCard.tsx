import { Address } from 'lib';
import { Token } from '@token/token';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { withSkeleton } from '../skeleton/withSkeleton';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenFiatValue } from '@token/useTokenValue';
import { TokenIcon } from './TokenIcon/TokenIcon';
import { Text } from 'react-native-paper';
import { TokenAmount } from './TokenAmount';
import { FiatValue } from '../fiat/FiatValue';

export interface TokenBalanceCardProps extends CardItemProps {
  token: Token;
  account: Address;
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
            <FiatValue value={useTokenFiatValue(token, balance)} />
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
