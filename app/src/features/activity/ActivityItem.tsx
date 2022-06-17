import { ItemProps } from '@components/list/Item';
import { isTx, Tx } from '~/queries/tx/useTxs';
import { TxItem, TxItemProps } from './tx/TxItem';
import { TransferItem } from './TransferItem';
import { isTransfer, Transfer } from '~/queries/tx/transfer';
import { TX_STATUS_INSET } from './useTxStatusStyles';
import { Title } from 'react-native-paper';

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
  ) : isTx(activity) ? (
    <TxItem tx={activity} {...txProps} {...itemProps} />
  ) : (
    <Title>Ops</Title>
  );
