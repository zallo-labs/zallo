import { Box } from '@components/Box';
import { ReactNode } from 'react';
import { CardItemSkeleton } from '~/components2/card/CardItemSkeleton';
import { Container } from '../list/Container';
import { ScreenSkeleton } from './ScreenSkeleton';

export interface ListScreenSkeletonProps {
  Header?: ReactNode;
}

export const ListScreenSkeleton = ({ Header }: ListScreenSkeletonProps) => (
  <ScreenSkeleton>
    <Container mx={3} separator={<Box my={2} />}>
      {Header}

      <CardItemSkeleton />
      <CardItemSkeleton />
      <CardItemSkeleton />
    </Container>
  </ScreenSkeleton>
);
