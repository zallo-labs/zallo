import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { TokenAmountRow } from './TokenAmountRow';
import { TxToken } from './useTxTokens';

export interface TxTokensProps {
  tokens: TxToken[];
  style?: StyleProp<ViewStyle>;
}

export const TxTokens = ({ tokens, style }: TxTokensProps) => {
  const insufficient = tokens.some((t) => t.amount.gt(t.available));

  if (!tokens.some((t) => !t.amount.isZero())) return null;

  return (
    <Box style={style}>
      <Box vertical>
        {insufficient && <Text variant="titleSmall">Insufficient balance</Text>}

        <Box horizontal justifyContent="space-between" alignItems="center">
          <Text variant="titleSmall">Available</Text>
          <Text variant="titleSmall">Amount</Text>
        </Box>
      </Box>

      {tokens.map(
        (t) =>
          !t.amount.isZero() && (
            <TokenAmountRow
              key={t.token.addr}
              token={t.token}
              amount={t.amount}
            />
          ),
      )}
    </Box>
  );
};
