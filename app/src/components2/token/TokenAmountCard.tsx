import { FiatValue } from '@components/FiatValue';
import { TokenIcon } from '@components/token/TokenIcon';
import { BigNumberish } from 'ethers';
import { Text } from 'react-native-paper';
import { Token } from '~/token/token';
import { useTokenValue } from '~/token/useTokenValue';
import { CardItem, CardItemProps } from '../card/CardItem';
import { TokenAmount } from './TokenAmount';

export interface TokenAmountCardProps extends CardItemProps {
  token: Token;
  amount: BigNumberish;
}

export const TokenAmountCard = ({ token: t, amount, ...itemProps }: TokenAmountCardProps) => {
  const { fiatValue } = useTokenValue(t, amount);

  return (
    <CardItem
      Left={<TokenIcon token={t} />}
      Main={[
        <Text key={0} variant="titleMedium">
          {t.name}
        </Text>,
        <Text key={1} variant="bodyMedium">
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
