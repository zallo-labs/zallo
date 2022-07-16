import { ItemProps } from '@components/list/Item';
import { TxItem, TxItemProps } from './tx/TxItem';
import { TransferItem } from './TransferItem';
import { TX_STATUS_INSET } from './useTxStatusStyles';
import { Tx } from '~/queries/tx';
import { Transfer, isTransfer } from '~/queries/tx/transfer.sub';

export type Activity = Tx | Transfer;

export interface ActivityItemProps extends ItemProps {
  activity: Activity;
  txProps?: Partial<TxItemProps>;
}

export const ActivityItem = ({
  activity,
  txProps,
  ...itemProps
}: ActivityItemProps) =>
  isTransfer(activity) ? (
    <TransferItem transfer={activity} {...TX_STATUS_INSET} {...itemProps} />
  ) : (
    <TxItem tx={activity} {...txProps} {...itemProps} />
  );
