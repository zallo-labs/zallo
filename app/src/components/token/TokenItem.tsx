import { AccountId } from '@api/account';
import { makeStyles } from '@theme/makeStyles';
import { Token } from '@token/token';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';
import { useTokenPriceData } from '@uniswap/useTokenPrice';
import { StyleProp, ViewStyle } from 'react-native';
import { FiatValue } from '../fiat/FiatValue';
import { Box } from '../layout/Box';
import { ListItem, ListItemProps } from '../list/ListItem';
import { ListItemSkeleton } from '../list/ListItemSkeleton';
import { withSkeleton } from '../skeleton/withSkeleton';
import { TokenAmount } from './TokenAmount';

export interface TokenItemProps extends Partial<ListItemProps> {
  token: Token;
  account: AccountId;
  amount?: bigint;
  style?: StyleProp<ViewStyle>;
}

export const TokenItem = withSkeleton(
  ({ token, account, amount, style, ...itemProps }: TokenItemProps) => {
    const styles = useStyles();
    const balance = useTokenBalance(token, account);
    amount ??= balance;

    return (
      <ListItem
        leading={token.addr}
        headline={token.name}
        supporting={({ Text }) => (
          <Box horizontal>
            <Text>
              <TokenAmount token={token} amount={amount} />
            </Text>

            <Text style={styles.price}>
              {' @ '}
              <FiatValue value={useTokenPriceData(token).current} maximumFractionDigits={0} />
            </Text>
          </Box>
        )}
        trailing={({ Text }) => (
          <Text variant="labelLarge">
            <FiatValue value={useTokenValue(token, amount)} />
          </Text>
        )}
        style={style}
        {...itemProps}
      />
    );
  },
  <ListItemSkeleton leading supporting trailing />,
);

const useStyles = makeStyles(({ colors }) => ({
  price: {
    color: colors.secondary,
  },
}));
