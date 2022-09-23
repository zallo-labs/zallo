import { makeStyles } from '@theme/makeStyles';
import { useToken } from '@token/useToken';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { useTokenValue } from '@token/useTokenValue';
import { Address, Limit, UserId } from 'lib';
import { StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Box } from '~/components/layout/Box';
import { TokenAmount } from '~/components/token/TokenAmount';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';

export interface TokenLimitItemProps {
  user: UserId;
  token: Address;
  limit?: Limit;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TokenLimitItem = ({
  user,
  token: tokenAddr,
  limit,
  onPress,
  style,
}: TokenLimitItemProps) => {
  const styles = useStyles();
  const token = useToken(tokenAddr);
  const available = useTokenAvailable(token, user);

  return (
    <TouchableRipple onPress={onPress}>
      <Box horizontal alignItems="center" style={[styles.root, style]}>
        <TokenIcon token={token} style={styles.icon} />

        <Box flex={1} vertical justifyContent="center">
          <Text variant="titleMedium">{token.name}</Text>

          {limit && (
            <Text variant="bodyMedium">
              <TokenAmount token={token} amount={limit.amount} symbol={false} />
              {` /${limit.period}`}
            </Text>
          )}
        </Box>

        <Box vertical justifyContent="center" alignItems="flex-end">
          <Text variant="titleSmall">
            <FiatValue value={useTokenValue(token, available)} />
          </Text>

          <Text variant="bodyMedium">
            <TokenAmount token={token} amount={available} symbol={false} />
          </Text>
        </Box>
      </Box>
    </TouchableRipple>
  );
};

const useStyles = makeStyles(({ space }) => ({
  root: {
    paddingVertical: space(1),
  },
  icon: {
    marginRight: space(2),
  },
}));
