import { Accordion, AccordionProps } from '@components/Accordion';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Timeline, TimelineProps } from './Timeline';

export type TimelineAccordionProps = TimelineProps & Partial<AccordionProps>;

export const TimelineAccordion = ({
  tx,
  ...accordionProps
}: TimelineAccordionProps) => {
  const { iconSize } = useTheme();

  return (
    <Accordion
      title="Timeline"
      left={(props) => (
        <MaterialCommunityIcons
          {...props}
          name="chart-timeline-variant"
          size={iconSize.small}
        />
      )}
      {...accordionProps}
    >
      <Timeline tx={tx} />
    </Accordion>
  );
};
