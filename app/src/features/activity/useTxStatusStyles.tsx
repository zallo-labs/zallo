import { useTheme } from 'react-native-paper';
import { useGroupsReachedThreshold } from '~/mutations/tx/useGroupsReachedThreshold';
import { Tx, TxStatus } from '~/queries/tx/useTxs';

const borderLeftWidth = 3;

export const TX_STATUS_INSET = {
  borderLeftWidth,
  borderLeftColor: 'transparent',
};

export const useTxStatusStyles = (tx: Tx) => {
  const { colors } = useTheme();
  const groupsReached = useGroupsReachedThreshold()(tx);

  let color = undefined;
  if (tx.status === TxStatus.Proposed) {
    color =
      !tx.userHasApproved || groupsReached
        ? colors.primary
        : colors.onBackground;
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
