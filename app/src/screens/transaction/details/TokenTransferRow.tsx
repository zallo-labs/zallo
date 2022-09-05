import { Box } from '~/components/layout/Box';
import { Text } from 'react-native-paper';
import { TokenAmount } from '~/components/token/TokenAmount';
import { useTxContext } from '../TransactionProvider';
import { makeStyles } from '@theme/makeStyles';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { TxTransfer } from './useTxTransfers';

export interface TokenTransferRowProps {
  transfer: TxTransfer;
}

export const TokenTransferRow = ({
  transfer: { token, amount, available },
}: TokenTransferRowProps) => {
  const styles = useStyles();
  const { wallet } = useTxContext();

  const insufficient = amount.gt(available);

  return (
    <Box horizontal justifyContent="space-between" alignItems="center">
      <Text variant="bodyMedium" style={insufficient && styles.insufficient}>
        <TokenAmount token={token} amount={amount} />
      </Text>

      <Text variant="bodyMedium" style={insufficient && styles.insufficient}>
        <TokenAmount token={token} amount={useTokenAvailable(token, wallet)} />
      </Text>
    </Box>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  insufficient: {
    color: colors.error,
  },
}));
