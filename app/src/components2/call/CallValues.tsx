import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { TokenValue } from '@components/token/TokenValue';
import { useDecodedTransfer } from '@features/activity/tx/useDecodedTransfer';
import { Call, ZERO } from 'lib';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Token } from '~/token/token';
import { ETH } from '~/token/tokens';
import { useTokenValue } from '~/token/useTokenValue';

export interface CallValuesProps {
  call: Call;
  token: Token;
  textStyle?: StyleProp<TextStyle>;
}

export const CallValues = ({ call, token, textStyle }: CallValuesProps) => {
  const transferAmount = useDecodedTransfer(call.to, call.data)?.value ?? ZERO;
  const ethValue = useTokenValue(ETH, call.value);
  const transferValue = useTokenValue(token, transferAmount);

  const totalFiat = ethValue.fiatValue + transferValue.fiatValue;

  return (
    <Box vertical justifyContent="space-around" alignItems="flex-end">
      <Text variant="titleMedium" style={textStyle}>
        <FiatValue value={totalFiat} />
      </Text>

      <Text variant="bodyMedium" style={textStyle}>
        <TokenValue token={ETH} value={call.value} />
      </Text>

      <Text variant="bodyMedium" style={textStyle}>
        <TokenValue token={token} value={transferAmount} />
      </Text>
    </Box>
  );
};
