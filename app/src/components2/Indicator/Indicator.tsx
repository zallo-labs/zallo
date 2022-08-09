import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { IndicatorCircle } from './IndicatorCircle';

export interface IndicatorProps {
  n: number;
  position: number;
}

export const Indicator = ({ n, position }: IndicatorProps) => {
  return (
    <Container horizontal alignItems="center" separator={<Box mx={1} />}>
      {Array.from({ length: n }, (_, i) => (
        <IndicatorCircle key={i} selected={position === i} />
      ))}
    </Container>
  );
};
