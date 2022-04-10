import { Paragraph, useTheme } from 'react-native-paper';

export interface PriceDeltaProps {
  delta: number;
}

export const PriceDelta = ({ delta }: PriceDeltaProps) => {
  const { colors } = useTheme();

  const color = delta !== 0 ? (delta > 0 ? colors.success : colors.danger) : colors.placeholder;

  return <Paragraph style={{ color }}>{delta.toFixed(2)}%</Paragraph>;
};
