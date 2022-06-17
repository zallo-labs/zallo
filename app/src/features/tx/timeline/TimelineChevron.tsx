import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface TimelineChevronProps {
  color: string;
  expanded?: boolean;
}

export const TimelineChevron = ({ color, expanded }: TimelineChevronProps) => {
  return (
    <MaterialCommunityIcons
      name={expanded ? 'chevron-up' : 'chevron-down'}
      color={color}
      size={25}
      // Remove default margin
      style={{ margin: -10 }}
    />
  );
};
