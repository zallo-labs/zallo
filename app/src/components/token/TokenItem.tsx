import { AccountId } from '@api/account';
import { makeStyles } from '@theme/makeStyles';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenPriceData } from '@uniswap/useTokenPrice';
import { StyleProp, View, ViewStyle } from 'react-native';
import { FiatValue } from '../fiat/FiatValue';
import { ListItem, ListItemProps } from '../list/ListItem';
import { ListItemSkeleton } from '../list/ListItemSkeleton';
import { withSuspense } from '../skeleton/withSuspense';
import { TokenAmount } from './TokenAmount';
import { Address } from 'lib';
import { useToken } from '@token/useToken';

export interface TokenItemProps extends Partial<ListItemProps> {
  token: Address;
  account: AccountId;
  amount?: bigint;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TokenItem = withSuspense(
  ({ token: tokenProp, account, amount, containerStyle, ...itemProps }: TokenItemProps) => {
    const styles = useStyles();
    const token = useToken(tokenProp);
    const balance = useTokenBalance(token, account);
    amount ??= balance;

    return (
      <ListItem
        leading={token.address}
        headline={token.name}
        supporting={({ Text }) => (
          <View style={styles.supportingContainer}>
            <Text>
              <TokenAmount token={token} amount={amount} />
            </Text>

            <Text style={styles.price}>
              {' @ '}
              <FiatValue value={useTokenPriceData(token).current} maximumFractionDigits={0} />
            </Text>
          </View>
        )}
        trailing={({ Text }) => (
          <Text variant="labelLarge">
            <FiatValue value={{ token, amount: amount! }} />
          </Text>
        )}
        containerStyle={containerStyle}
        {...itemProps}
      />
    );
  },
  (props) => <ListItemSkeleton {...props} leading supporting trailing />,
);

const useStyles = makeStyles(({ colors }) => ({
  price: {
    color: colors.secondary,
    textAlignVertical: 'center',
  },
  supportingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
