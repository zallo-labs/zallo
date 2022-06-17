import { Accordion, AccordionProps } from '@components/Accordion';
import { SECONDARY_ICON_SIZE } from '@components/list/Item';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Timeline, TimelineProps } from './Timeline';

export type TimelineAccordionProps = TimelineProps & Partial<AccordionProps>;

export const TimelineAccordion = ({
  tx,
  ...accordionProps
}: TimelineAccordionProps) => {
  return (
    <Accordion
      title="Timeline"
      left={(props) => (
        <MaterialCommunityIcons
          {...props}
          name="chart-timeline-variant"
          size={SECONDARY_ICON_SIZE}
        />
      )}
      {...accordionProps}
    >
      <Timeline tx={tx} />
    </Accordion>
  );
};
