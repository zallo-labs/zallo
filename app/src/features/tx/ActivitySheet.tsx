import { useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { Sheet } from './sheet/Sheet';
import { Activity, ActivityItem } from '@features/activity/ActivityItem';
import { isExecutedTx, isTx } from '~/queries/tx/useTxs';
import { TxDetailsAccordion } from './details/TxDetailsAccordion';
import { TxTransfersAccordion } from './TxTransfersAccordion';
import { Box } from '@components/Box';
import { AccordionProps } from '@components/Accordion';
import { TimelineAccordion } from './timeline/TimelineAccordion';
import { CommentsAccordion } from './comments/CommentsAccordion';
import { isCommentable } from '~/queries/useComments';

const accordionProps: Partial<AccordionProps> = { mx: 3, my: 2 };

export interface ActivitySheetProps {
  activity: Activity;
  onClose: () => void;
}

export const ActivitySheet = ({ activity, onClose }: ActivitySheetProps) => {
  const sheetRef = useRef<BottomSheet>(null);

  return (
    <Sheet
      ref={sheetRef}
      initialSnapPoints={[]}
      onClose={onClose}
      enablePanDownToClose
    >
      <ActivityItem
        activity={activity}
        px={3}
        txProps={{
          status: false,
          dividers: false,
        }}
      />

      {isTx(activity) && (
        <>
          <TimelineAccordion
            tx={activity}
            {...accordionProps}
            initiallyExpanded
          />

          <TxDetailsAccordion tx={activity} {...accordionProps} />

          {isExecutedTx(activity) && (
            <TxTransfersAccordion tx={activity} {...accordionProps} />
          )}
        </>
      )}

      {isCommentable(activity) && (
        <CommentsAccordion
          commentable={activity}
          {...accordionProps}
          initiallyExpanded
        />
      )}

      <Box mb={1} />
    </Sheet>
  );
};
