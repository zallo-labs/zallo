import { memo } from 'react';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { PaginationDot } from './PaginationDot';

export interface PaginationProps {
  n: number;
  position: number;
}

export const Pagination = memo(({ n, position }: PaginationProps) => (
  <Container horizontal alignItems="center" separator={<Box mx={1} />}>
    {Array.from({ length: n }, (_, i) => (
      <PaginationDot key={i} selected={position === i} />
    ))}
  </Container>
));
