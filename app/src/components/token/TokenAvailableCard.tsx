import { Token } from '@token/token';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { withSkeleton } from '../skeleton/withSkeleton';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { Text } from 'react-native-paper';
import { useTokenValue } from '@token/useTokenValue';
import { FiatValue } from '../fiat/FiatValue';
import { TokenAmount } from './TokenAmount';
import { TokenIcon } from './TokenIcon/TokenIcon';
import { AccountIdlike } from '@api/account';

export interface TokenAvailableCardProps extends CardItemProps {
  token: Token;
  account: AccountIdlike;
  showZero?: boolean;
}

export const TokenAvailableCard = withSkeleton(
  ({ token, account, ...itemProps }: TokenAvailableCardProps) => {
    const available = useTokenAvailable(token, account);

    return (
      <CardItem
        Left={<TokenIcon token={token} />}
        Main={<Text variant="titleMedium">{token.name}</Text>}
        Right={[
          <Text variant="titleSmall">
            <FiatValue value={useTokenValue(token, available)} />
          </Text>,
          <Text variant="bodyMedium">
            <TokenAmount token={token} amount={available} />
          </Text>,
        ]}
        {...itemProps}
      />
    );
  },
  CardItemSkeleton,
);
