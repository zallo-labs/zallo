import { Paragraph, useTheme } from 'react-native-paper';
import { Percent } from './Percent';

export interface PriceDeltaProps {
  change: number;
}

export const PriceChange = ({ change }: PriceDeltaProps) => {
  const { colors } = useTheme();

  const color =
    change !== 0
      ? change > 0
        ? colors.success
        : colors.error
      : colors.placeholder;

  return (
    <Paragraph style={{ color }}>
      <Percent sign>{change}</Percent>
    </Paragraph>
  );
};
