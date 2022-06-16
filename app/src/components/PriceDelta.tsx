import { Paragraph, useTheme } from 'react-native-paper';
import { Percent } from './Percent';

export interface PriceDeltaProps {
  delta: number;
}

export const PriceDelta = ({ delta }: PriceDeltaProps) => {
  const { colors } = useTheme();

  const color =
    delta !== 0
      ? delta > 0
        ? colors.success
        : colors.error
      : colors.placeholder;

  return (
    <Paragraph style={{ color }}>
      <Percent sign>{delta}</Percent>
    </Paragraph>
  );
};
