import { Text } from 'react-native-paper';
import { useTokenPrice } from '~/queries/useTokenPrice.uni';
import { Token } from '@token/token';
import { CardItem, CardItemProps } from '../card/CardItem';
import { WalletId } from '~/queries/wallets';
import { makeStyles } from '@theme/makeStyles';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { useTokenValue } from '@token/useTokenValue';
import { FiatValue } from '../fiat/FiatValue';
import { PriceChange } from '../format/PriceDelta';
import { Box } from '../layout/Box';
import { Container } from '../layout/Container';
import { TokenIcon } from './TokenIcon/TokenIcon';
import { TokenAmount } from './TokenAmount';

export interface TokenHoldingCardProps extends CardItemProps {
  token: Token;
  wallet: WalletId;
  selected?: boolean;
}

export const TokenHoldingCard = ({
  token: t,
  wallet,
  selected,
  ...props
}: TokenHoldingCardProps) => {
  const styles = useStyles();
  const { price } = useTokenPrice(t);
  const available = useTokenAvailable(t, wallet);
  const { fiatValue } = useTokenValue(t, available);

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
      {...(selected && { style: [props.style, styles.selected] })}
    />
  );
};

const useStyles = makeStyles(({ colors }) => ({
  selected: {
    backgroundColor: colors.surfaceVariant,
  },
  opaqueText: {
    color: colors.onSurfaceOpaque,
  },
}));
