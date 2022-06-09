import { useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { Sheet } from './Sheet';
import { Tx } from '@gql/queries/useTxs';
import { TxItem } from '@features/activity/tx/TxItem';
import { Timeline } from './timeline/Timeline';

export interface TxSheetProps {
  tx: Tx;
}

export const TxSheet = ({ tx }: TxSheetProps) => {
  const sheetRef = useRef<BottomSheet>(null);

  return (
    <Sheet ref={sheetRef} initialSnapPoints={[]}>
      <TxItem tx={tx} status={false} dividers={false} px={3} py={2} />
      <Timeline tx={tx} />
    </Sheet>
  );
};
