import { Box } from '@components/Box';
import { StyleProp, ViewStyle } from 'react-native';
import DashedLine from 'react-native-dashed-line';

const minHeight = 40;
const width = 3;
const borderRadius = 5;
const dashGap = 5;

const dashedLineStyle: StyleProp<ViewStyle> = {
  minHeight,
  // The last dash also has marginBottom=dashGap, which is not what we want
  marginBottom: -dashGap,
};

const dashStyle: StyleProp<ViewStyle> = { borderRadius };

export interface TimelineConnectorProps {
  color: string;
  dotted?: boolean;
}

export const TimelineConnector = ({ color, dotted }: TimelineConnectorProps) =>
  dotted ? (
    <DashedLine
      axis="vertical"
      dashLength={10}
      dashThickness={width}
      style={dashedLineStyle}
      dashColor={color}
      dashGap={dashGap}
      dashStyle={dashStyle}
    />
  ) : (
    <Box style={{ minHeight, width, borderRadius }} backgroundColor={color} />
  );
