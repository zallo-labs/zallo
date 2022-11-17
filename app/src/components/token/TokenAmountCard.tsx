import { BigNumberish } from 'ethers';
import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../card/CardItem';
import { TokenAmount } from './TokenAmount';
import { Token } from '@token/token';
import { useTokenValue } from '@token/useTokenValue';
import { FiatValue } from '../fiat/FiatValue';
import TokenIcon from './TokenIcon/TokenIcon';

export interface TokenAmountCardProps extends CardItemProps {
  token: Token;
  amount: BigNumberish;
}

export const TokenAmountCard = ({ token: t, amount, ...itemProps }: TokenAmountCardProps) => {
  const fiatValue = useTokenValue(t, amount);

  return (
    <CardItem
      Left={<TokenIcon token={t} />}
      Main={[
        <Text variant="titleMedium">{t.name}</Text>,
        <Text variant="bodyMedium">
          <TokenAmount token={t} amount={amount} />
        </Text>,
      ]}
      Right={
        <Text variant="bodyLarge">
          <FiatValue value={fiatValue} />
        </Text>
      }
      {...itemProps}
    />
  );
};
