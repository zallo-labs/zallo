import { Text } from 'react-native-paper';
import { Token } from '@token/token';
import { CardItem, CardItemProps } from '../card/CardItem';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { useTokenValue } from '@token/useTokenValue';
import { FiatValue } from '../fiat/FiatValue';
import { PriceChange } from '../format/PriceDelta';
import { Box } from '../layout/Box';
import { Container } from '../layout/Container';
import TokenIcon from './TokenIcon/TokenIcon';
import { TokenAmount } from './TokenAmount';
import { useTokenPrice } from '~/queries/useTokenPrice.uni';
import { CombinedUser } from '~/queries/user/useUser.api';

export interface TokenHoldingCardProps extends CardItemProps {
  token: Token;
  user: CombinedUser;
  selected?: boolean;
}

export const TokenHoldingCard = ({ token: t, user, selected, ...props }: TokenHoldingCardProps) => {
  const price = useTokenPrice(t);
  const available = useTokenAvailable(t, user);
  const fiatValue = useTokenValue(t, available);

  return (
    <CardItem
      Left={<TokenIcon token={t} />}
      Main={[
        <Text variant="titleMedium">{t.name}</Text>,
        <Container horizontal separator={<Box mx={1} />}>
          <Text variant="bodyMedium">
            <FiatValue value={price.current} />
          </Text>

          <Text variant="bodyMedium">
            <PriceChange change={price.change} />
          </Text>
        </Container>,
      ]}
      Right={[
        <Text variant="titleSmall">
          <FiatValue value={fiatValue} />
        </Text>,
        <Text variant="bodyMedium">
          <TokenAmount token={t} amount={available} symbol={false} />
        </Text>,
      ]}
      {...props}
      elevation={selected ? 2 : 1}
    />
  );
};
