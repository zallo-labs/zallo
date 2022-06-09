import { Box } from '@components/Box';
import DashedLine from 'react-native-dashed-line';

const minHeight = 40;
const width = 3;
const borderRadius = 5;

export interface TimelineConnectorProps {
  color: string;
  dotted?: boolean;
}

export const TimelineConnector = ({
  color,
  dotted,
}: TimelineConnectorProps) => {
  if (!dotted)
    return (
      <Box style={{ minHeight, width, borderRadius }} backgroundColor={color} />
    );

  return (
    <DashedLine
      axis="vertical"
      dashLength={10}
      dashThickness={width}
      style={{ minHeight }}
      dashColor={color}
      dashGap={5}
      dashStyle={{ borderRadius }}
    />
  );
};
