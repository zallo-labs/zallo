import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { Container } from '@components/list/Container';
import { PriceChange } from '@components/PriceDelta';
import { TokenIcon } from '@components/token/TokenIcon';
import { TokenValue } from '@components/token/TokenValue';
import { BigNumber } from 'ethers';
import { Text } from 'react-native-paper';
import { useTokenPrice } from '~/queries/useTokenPrice.uni';
import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { useTokenValue } from '~/token/useTokenValue';
import { CardItem } from '../card/CardItem';

export interface TokenCardProps {
  token: Token;
  price?: boolean;
  change?: boolean;
  fiatAmount?: boolean;
  amount?: BigNumber;
  remaining?: boolean;
}

export const TokenCard = ({ token: t, amount, ...props }: TokenCardProps) => {
  const { price } = useTokenPrice(t);
  const balance = useTokenBalance(t);
  const { fiatValue } = useTokenValue(t, amount ?? balance);

  return (
    <CardItem
      Left={<TokenIcon token={t} />}
      Main={[
        <Text variant="titleMedium">{t.name}</Text>,
        props.price && (
          <Container horizontal separator={<Box mx={1} />}>
            <Text variant="bodyMedium">
              <FiatValue value={price.current} />
            </Text>

            {props.change && (
              <Text variant="bodyMedium">
                <PriceChange change={price.change} />
              </Text>
            )}
          </Container>
        ),
      ]}
      Right={[
        props.fiatAmount && (
          <Text variant="titleSmall">
            <FiatValue value={fiatValue} />
          </Text>
        ),
        amount && (
          <Text variant="titleSmall">
            <TokenValue token={t} value={amount} symbol={false} />
          </Text>
        ),
        props.remaining && <Text variant="bodyMedium">/xxx</Text>,
      ]}
    />
  );
};
