import { PriceChange } from '@components/PriceDelta';
import { TokenIcon } from '@components/token/TokenIcon';
import { Text } from 'react-native-paper';
import { useTokenPrice } from '~/queries/useTokenPrice.uni';
import { Token } from '~/token/token';
import { CardItem, CardItemProps } from '../card/CardItem';
import { FiatValue } from '../fiat/FiatValue';

export interface TokenCardProps extends CardItemProps {
  token: Token;
}

export const TokenCard = ({ token, ...itemProps }: TokenCardProps) => {
  const { price } = useTokenPrice(token);

  return (
    <CardItem
      Left={<TokenIcon token={token} />}
      Main={<Text variant="titleMedium">{token.name}</Text>}
      Right={[
        <Text variant="bodyMedium">
          <FiatValue value={price.current} />
        </Text>,

        <Text variant="bodyMedium">
          <PriceChange change={price.change} />
        </Text>,
      ]}
      {...itemProps}
    />
  );
};
