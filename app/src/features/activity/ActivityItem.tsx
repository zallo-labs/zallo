import { ItemProps } from '@components/list/Item';
import { TxItem, TxItemProps } from './tx/TxItem';
import { TransferItem } from './TransferItem';
import { TX_STATUS_INSET } from './useTxStatusStyles';
import { Title } from 'react-native-paper';
import { isTx, Tx } from '~/queries/tx';
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
  ) : isTx(activity) ? (
    <TxItem tx={activity} {...txProps} {...itemProps} />
  ) : (
    <Title>Ops</Title>
  );
