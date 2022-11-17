import { useToken } from '@token/useToken';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { useTokenBalance } from '@token/useTokenBalance';
import { useTokenValue } from '@token/useTokenValue';
import { Address, UserId } from 'lib';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { TokenAmount } from '~/components/token/TokenAmount';

export interface LimitAvailableProps {
  user: UserId;
  token: Address;
  style?: StyleProp<ViewStyle>;
}

export const LimitAvailable = ({ user, token: tokenAddr, style }: LimitAvailableProps) => {
  const token = useToken(tokenAddr);
  const available = useTokenAvailable(token, user);
  const balance = useTokenBalance(token, user);

  return (
    <Container vertical alignItems="center" separator={<Box mt={1} />} style={style}>
      <Text variant="titleSmall">Available</Text>

      <Box horizontal alignItems="baseline">
        <Text variant="titleLarge">
          <FiatValue value={useTokenValue(token, available)} symbol={false} />
        </Text>

        <Text variant="bodyLarge">
          {` / `}
          <FiatValue value={useTokenValue(token, balance)} />
        </Text>
      </Box>

      <Box horizontal alignItems="baseline">
        <Text variant="titleMedium">
          <TokenAmount token={token} amount={available} symbol={false} />
        </Text>

        <Text variant="bodyMedium">
          {` / `}
          <TokenAmount token={token} amount={balance} />
        </Text>
      </Box>
    </Container>
  );
};
