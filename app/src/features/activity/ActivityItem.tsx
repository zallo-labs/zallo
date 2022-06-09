import { ItemProps } from '@components/list/Item';
import { Tx } from '~/queries/useTxs';
import { isTransfer, Transfer } from '~/queries/useIndependentTransfers';
import { TxItem } from './tx/TxItem';
import { TransferItem } from './TransferItem';

export type Activity = Tx | Transfer;

export interface ActivityItemProps extends ItemProps {
  activity: Activity;
}

export const ActivityItem = ({ activity, ...itemProps }: ActivityItemProps) => {
  if (isTransfer(activity))
    return <TransferItem transfer={activity} {...itemProps} />;

  return <TxItem tx={activity} {...itemProps} />;
};
