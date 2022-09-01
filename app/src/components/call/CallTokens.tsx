import { FiatValue } from '~/components/fiat/FiatValue';
import { Call } from 'lib';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { TokenAmount } from '../token/TokenAmount';
import { useCallTokens } from './useCallTokens';

export interface CallTokensProps {
  call: Call;
  textStyle?: StyleProp<TextStyle>;
}

export const CallTokens = ({ call, textStyle }: CallTokensProps) => {
  const tokens = useCallTokens(call);

  const totalFiat = tokens.reduce((acc, t) => acc + t.fiat, 0);

  return (
    <Box vertical justifyContent="space-around" alignItems="flex-end">
      {!!totalFiat && (
        <Text variant="titleMedium" style={textStyle}>
          <FiatValue value={totalFiat} />
        </Text>
      )}

      {tokens.map(
        (t) =>
          !t.amount.isZero() && (
            <Text variant="bodyMedium" style={textStyle}>
              <TokenAmount token={t.token} amount={t.amount} />
            </Text>
          ),
      )}
    </Box>
  );
};
