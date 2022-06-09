import { Box } from '@components/Box';
import { Divider } from '@components/Divider';
import { ItemProps } from '@components/list/Item';
import { isExecutedTx, Tx } from '@gql/queries/useTxs';
import { useTheme } from 'react-native-paper';
import { TransferItem } from '../TransferItem';
import { OpsGroup, OpsGroupItem } from './OpsGroupItem';

export interface TxItemProps extends ItemProps {
  tx: Tx;
  status?: boolean;
  dividers?: boolean;
}

export const TxItem = ({
  tx,
  status = true,
  dividers = true,
  ...itemProps
}: TxItemProps) => {
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

  const showDividers = dividers && groups.length > 1;

  return (
    <Box
      vertical
      {...(status &&
        tx.status === 'proposed' && {
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
        })}
    >
      {showDividers && <Divider mx={3} />}

      {groups.map((group) => (
        <OpsGroupItem key={group.to} group={group} {...itemProps} />
      ))}

      {isExecutedTx(tx) &&
        tx.transfers.map((t) => <TransferItem key={t.id} transfer={t} />)}

      {showDividers && <Divider mx={3} />}
    </Box>
  );
};
