import { Chevron } from '@components/Chevron';

export interface TimelineChevronProps {
  color: string;
  expanded?: boolean;
}

export const TimelineChevron = ({ color, expanded }: TimelineChevronProps) => (
  <Chevron
    expanded={expanded}
    color={color}
    size={25}
    // Remove default margin
    style={{ margin: -10 }}
  />
);
