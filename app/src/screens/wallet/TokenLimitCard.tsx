import { useToken } from '@token/useToken';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { useTokenFiatValue } from '@token/useTokenValue';
import { Address } from 'lib';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { CardItemProps, CardItem } from '~/components/card/CardItem';
import { FiatValue } from '~/components/fiat/FiatValue';
import { TokenAmount } from '~/components/token/TokenAmount';
import { TokenIcon } from '~/components/token/TokenIcon/TokenIcon';
import { latest, Proposable } from '~/gql/proposable';
import { TokenLimit, WalletId } from '~/queries/wallets';

export interface TokenLimitCardProps extends CardItemProps {
  wallet: WalletId;
  token: Address;
  limit: Proposable<TokenLimit>;
}

export const TokenLimitCard = memo(
  ({ wallet, token: tokenAddr, limit, ...itemProps }: TokenLimitCardProps) => {
    const token = useToken(tokenAddr);
    const available = useTokenAvailable(token, wallet);

    const { amount, period } = latest(limit)!; // TODO: handle proposable

    return (
      <CardItem
        Left={<TokenIcon token={token} />}
        Main={[
          <Text variant="titleMedium">{token.name}</Text>,
          <Text variant="bodyMedium">
            <TokenAmount token={token} amount={amount} symbol={false} /> /
            {period}
          </Text>,
        ]}
        Right={[
          <Text variant="bodySmall">Available</Text>,
          <Text variant="titleSmall">
            <FiatValue value={useTokenFiatValue(token, available)} />
          </Text>,
          <Text variant="bodyMedium">
            <TokenAmount token={token} amount={available} symbol={false} />
          </Text>,
        ]}
        {...itemProps}
      />
    );
  },
);
