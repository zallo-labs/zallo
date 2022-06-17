import { Box } from '@components/Box';
import { Divider } from '@components/Divider';
import { ItemProps } from '@components/list/Item';
import { Tx } from '~/queries/tx/useTxs';
import { OpsGroup, OpsGroupItem } from './OpsGroupItem';
import { useTxStatusStyles } from '../useTxStatusStyles';

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
  const statusStyles = useTxStatusStyles(tx);

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
    <Box vertical {...(status && statusStyles)}>
      {showDividers && <Divider mx={3} />}

      {groups.map((group) => (
        <OpsGroupItem key={group.to} group={group} {...itemProps} />
      ))}

      {showDividers && <Divider mx={3} />}
    </Box>
  );
};
