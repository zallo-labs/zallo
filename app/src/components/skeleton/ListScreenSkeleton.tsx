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
    <Container mx={2} separator={<Box mt={1} />}>
      {Header}

      <CardItemSkeleton />
      <CardItemSkeleton />
      <CardItemSkeleton />
    </Container>
  </ScreenSkeleton>
);
