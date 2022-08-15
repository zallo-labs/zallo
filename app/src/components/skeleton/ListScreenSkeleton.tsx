import { Box } from '@components/Box';
import { ReactNode } from 'react';
import { CardItemSkeleton } from '~/components2/card/CardItemSkeleton';
import { Container } from '../list/Container';
import { ScreenSkeleton, ScreenSkeletonProps } from './ScreenSkeleton';

export interface ListScreenSkeletonProps extends ScreenSkeletonProps {
  Header?: ReactNode;
}

export const ListScreenSkeleton = ({
  Header,
  ...screenProps
}: ListScreenSkeletonProps) => (
  <ScreenSkeleton {...screenProps}>
    <Container mx={3} separator={<Box my={2} />}>
      {Header}

      <CardItemSkeleton />
      <CardItemSkeleton />
      <CardItemSkeleton />
    </Container>
  </ScreenSkeleton>
);
