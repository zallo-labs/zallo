import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { Proposal } from '~/queries/proposal';
import { TokenTransferRow } from './TokenTransferRow';
import { TxTransfer } from './useTxTransfers';

export interface TxTransfersProps {
  tx: Proposal;
  transfers: TxTransfer[];
  style?: StyleProp<ViewStyle>;
}

export const TxTransfers = ({ tx, transfers, style }: TxTransfersProps) => {
  if (!transfers.some((t) => !t.amount.isZero())) return null;

  return (
    <Box style={style}>
      <Box horizontal justifyContent="space-between" alignItems="center">
        <Text variant="titleSmall">Amount</Text>
        <Text variant="titleSmall">Available</Text>
      </Box>

      {transfers.map(
        (t) => !t.amount.isZero() && <TokenTransferRow key={t.token.addr} tx={tx} transfer={t} />,
      )}
    </Box>
  );
};
