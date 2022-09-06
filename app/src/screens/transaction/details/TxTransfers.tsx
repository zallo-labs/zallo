import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { Tx } from '~/queries/tx';
import { TokenTransferRow } from './TokenTransferRow';
import { TxTransfer } from './useTxTransfers';

export interface TxTransfersProps {
  tx: Tx;
  transfers: TxTransfer[];
  style?: StyleProp<ViewStyle>;
}

export const TxTransfers = ({ tx, transfers, style }: TxTransfersProps) => {
  const insufficient =
    tx.status !== 'executed' && transfers.some((t) => t.amount.gt(t.available));

  if (!transfers.some((t) => !t.amount.isZero())) return null;

  return (
    <Box style={style}>
      <Box vertical>
        {insufficient && <Text variant="titleSmall">Insufficient balance</Text>}

        <Box horizontal justifyContent="space-between" alignItems="center">
          <Text variant="titleSmall">Amount</Text>
          <Text variant="titleSmall">Available</Text>
        </Box>
      </Box>

      {transfers.map(
        (t) =>
          !t.amount.isZero() && (
            <TokenTransferRow key={t.token.addr} tx={tx} transfer={t} />
          ),
      )}
    </Box>
  );
};
