import { Box } from '~/components/layout/Box';
import { ReactNode } from 'react';
import { CardItemSkeleton } from '~/components/card/CardItemSkeleton';
import { ScreenSkeleton, ScreenSkeletonProps } from './ScreenSkeleton';
import { Container } from '~/components/layout/Container';

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
