import { useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { Sheet } from './sheet/Sheet';
import { Activity, ActivityItem } from '@features/activity/ActivityItem';
import { TxDetails } from './details/TxDetails';
import { TxTransfersAccordion } from './TxTransfersAccordion';
import { Box } from '@components/Box';
import { Accordion, AccordionProps } from '@components/Accordion';
import { Comments } from './comments/Comments';
import { Timeline } from './timeline/Timeline';
import { isTx, isExecutedTx } from '~/queries/tx';
import { isCommentable } from '~/queries/useComments.api';

const accordionProps: Partial<AccordionProps> = { mx: 3, my: 1 };

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
          <Accordion title="Timeline" initiallyExpanded {...accordionProps}>
            <Timeline tx={activity} />
          </Accordion>

          <Accordion title="Details" {...accordionProps}>
            <TxDetails tx={activity} />
          </Accordion>

          {isExecutedTx(activity) && (
            <TxTransfersAccordion tx={activity} {...accordionProps} />
          )}
        </>
      )}

      {isCommentable(activity) && (
        <Accordion title="Comments" {...accordionProps}>
          <Comments commentable={activity} />
        </Accordion>
      )}

      <Box mb={3} />
    </Sheet>
  );
};
