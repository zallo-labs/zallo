import { Box } from '@components/Box';
import { Divider } from '@components/Divider';
import { ItemProps } from '@components/list/Item';
import { Tx } from '~/queries/tx/useTxs';
import { CallsGroup, CallsGroupItem } from './CallsGroupItem';
import { useTxStatusStyles } from '../useTxStatusStyles';
import { useMemo } from 'react';
import { txReqToCalls } from '@util/multicall';

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

  const groups: CallsGroup[] = useMemo(
    () =>
      txReqToCalls(tx).reduce((groups: CallsGroup[], call) => {
        const lastGroup = groups[groups.length - 1];

        if (lastGroup?.to === call.to) {
          lastGroup.calls.push(call);
        } else {
          groups.push({
            to: call.to,
            calls: [call],
          });
        }

        return groups;
      }, []),
    [tx],
  );

  const showDividers = dividers && groups.length > 1;

  return (
    <Box vertical {...(status && statusStyles)}>
      {showDividers && <Divider mx={3} />}

      {groups.map((group) => (
        <CallsGroupItem key={group.to} group={group} {...itemProps} />
      ))}

      {showDividers && <Divider mx={3} />}
    </Box>
  );
};
