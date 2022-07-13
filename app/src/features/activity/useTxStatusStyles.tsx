import { useGroupsApproved } from '@features/execute/useGroupsApproved';
import { useTheme } from 'react-native-paper';
import { Tx, TxStatus } from '~/queries/tx/useTxs';

const borderLeftWidth = 3;

export const TX_STATUS_INSET = {
  borderLeftWidth,
  borderLeftColor: 'transparent',
};

export const useTxStatusStyles = (tx: Tx) => {
  const { colors } = useTheme();
  const isApproved = !!useGroupsApproved(tx);

  let color: string | undefined = undefined;
  if (tx.status === TxStatus.Proposed) {
    color =
      !tx.userHasApproved || isApproved ? colors.primary : colors.onBackground;
  } else if (tx.status === TxStatus.Submitted) {
    color = colors.success;
  }

  return color
    ? {
        borderLeftWidth,
        borderLeftColor: color,
      }
    : TX_STATUS_INSET;
};
