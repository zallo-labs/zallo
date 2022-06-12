import { ItemProps } from '@components/list/Item';
import { Tx } from '~/queries/tx/useTxs';
import { TxItem, TxItemProps } from './tx/TxItem';
import { TransferItem } from './TransferItem';
import { isTransfer, Transfer } from '~/queries/tx/transfer';
import { TX_STATUS_INSET } from './useTxStatusStyles';

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
