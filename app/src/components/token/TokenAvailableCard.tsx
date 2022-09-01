import { Token } from '@token/token';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { withSkeleton } from '../skeleton/withSkeleton';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { WalletId } from '~/queries/wallets';
import { Text } from 'react-native-paper';
import { useTokenFiatValue } from '@token/useTokenValue';
import { FiatValue } from '../fiat/FiatValue';
import { TokenAmount } from './TokenAmount';
import { TokenIcon } from './TokenIcon/TokenIcon';

export interface TokenAvailableCardProps extends CardItemProps {
  token: Token;
  wallet: WalletId;
  showZero?: boolean;
}

export const TokenAvailableCard = withSkeleton(
  ({ token, wallet, ...itemProps }: TokenAvailableCardProps) => {
    const available = useTokenAvailable(token, wallet);

    return (
      <CardItem
        Left={<TokenIcon token={token} />}
        Main={[
          <Text variant="titleMedium">{token.name}</Text>,
          <Text variant="bodyMedium">Available</Text>,
        ]}
        Right={[
          <Text variant="titleSmall">
            <FiatValue value={useTokenFiatValue(token, available)} />
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
