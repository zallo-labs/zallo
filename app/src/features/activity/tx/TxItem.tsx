import { Box } from '@components/Box';
import { Divider } from '@components/Divider';
import { ItemProps } from '@components/list/Item';
import { isExecutedTx, Tx } from '@gql/queries/useTxs';
import { useTheme } from 'react-native-paper';
import { TransferItem } from '../TransferItem';
import { OpsGroup, TxOpsGroupItem } from './TxOpsGroupItem';

export interface TxItemProps extends ItemProps {
  tx: Tx;
}

export const TxItem = ({ tx, ...itemProps }: TxItemProps) => {
  const { colors } = useTheme();

  const groups: OpsGroup[] = tx.ops.reduce((groups: OpsGroup[], op) => {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.to === op.to) {
      lastGroup.ops.push(op);
    } else {
      groups.push({
        to: op.to,
        ops: [op],
      });
    }

    return groups;
  }, []);

  return (
    <Box
      vertical
      {...(tx.status === 'proposed' && {
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
      })}
    >
      {groups.length > 1 && <Divider mx={3} />}

      {groups.map((group) => (
        <TxOpsGroupItem key={group.to} group={group} {...itemProps} />
      ))}

      {isExecutedTx(tx) &&
        tx.transfers.map((t) => <TransferItem key={t.id} transfer={t} />)}

      {groups.length > 1 && <Divider mx={3} />}
    </Box>
  );
};
