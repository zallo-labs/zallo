import { FiatValue } from '~/components/fiat/FiatValue';
import { TokenValue } from '~/components/token/TokenValue';
import { Call, ZERO } from 'lib';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { useCallValues } from './useCallValues';
import { Box } from '~/components/layout/Box';
import { useDecodedTransfer } from './useDecodedTransfer';

export interface CallValuesProps {
  call: Call;
  token: Token;
  textStyle?: StyleProp<TextStyle>;
}

export const CallValues = ({ call, token, textStyle }: CallValuesProps) => {
  const transferAmount = useDecodedTransfer(call.to, call.data)?.value ?? ZERO;
  const { totalFiat } = useCallValues(call, token);

  return (
    <Box vertical justifyContent="space-around" alignItems="flex-end">
      {!!totalFiat && (
        <Text variant="titleMedium" style={textStyle}>
          <FiatValue value={totalFiat} />
        </Text>
      )}

      {!call.value.isZero() && (
        <Text variant="bodyMedium" style={textStyle}>
          <TokenValue token={ETH} value={call.value} />
        </Text>
      )}

      {!transferAmount.isZero() && (
        <Text variant="bodyMedium" style={textStyle}>
          <TokenValue token={token} value={transferAmount} />
        </Text>
      )}
    </Box>
  );
};
