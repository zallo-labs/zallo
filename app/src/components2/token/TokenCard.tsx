import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { Container } from '@components/list/Container';
import { PriceChange } from '@components/PriceDelta';
import { TokenIcon } from '@components/token/TokenIcon';
import { TokenValue } from '@components/token/TokenValue';
import { makeStyles } from '@util/theme/makeStyles';
import { BigNumber } from 'ethers';
import { Text } from 'react-native-paper';
import { useTokenPrice } from '~/queries/useTokenPrice.uni';
import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { useTokenValue } from '~/token/useTokenValue';
import { CardItem, CardItemProps } from '../card/CardItem';

export interface TokenCardProps extends CardItemProps {
  token: Token;
  price?: boolean;
  change?: boolean;
  fiatAmount?: boolean;
  amount?: BigNumber | 'balance';
  remaining?: boolean;
  selected?: boolean;
}

export const TokenCard = ({
  token: t,
  selected,
  price: showPrice,
  change: showChange,
  fiatAmount: showFiatAmount,
  amount: amountProp,
  remaining: showRemaining,
  ...props
}: TokenCardProps) => {
  const styles = useStyles();
  const { price } = useTokenPrice(t);
  const balance = useTokenBalance(t);
  const amount = (amountProp !== 'balance' && amountProp) || balance;
  const { fiatValue } = useTokenValue(t, amount);

  return (
    <CardItem
      Left={<TokenIcon token={t} />}
      Main={[
        <Text variant="titleMedium">{t.name}</Text>,
        showPrice && (
          <Container horizontal separator={<Box mx={1} />}>
            <Text variant="bodyMedium">
              <FiatValue value={price.current} />
            </Text>

            {showChange && (
              <Text variant="bodyMedium">
                <PriceChange change={price.change} />
              </Text>
            )}
          </Container>
        ),
      ]}
      Right={[
        showFiatAmount && (
          <Text variant="titleSmall">
            <FiatValue value={fiatValue} showZero />
          </Text>
        ),
        amount && (
          <Text variant="titleSmall">
            <TokenValue token={t} value={amount} symbol={false} showZero />
          </Text>
        ),
        showRemaining && (
          <Text variant="bodyMedium" style={styles.opaqueText}>
            /xxx
          </Text>
        ),
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
