import { FC, ReactNode } from 'react';
import { Box } from '@components/Box';
import { isFunctionalComponent } from '@util/typing';
import { Card, CardProps } from './Card';

export interface CardItemWithoutSkeletonProps extends CardProps {
  Left?: ReactNode | FC;
  Main?: ReactNode | FC;
  Right?: ReactNode | FC;
}

export const CardItemWithoutSkeleton = ({
  Left,
  Main,
  Right,
  ...cardProps
}: CardItemWithoutSkeletonProps) => (
  <Card {...cardProps}>
    <Box horizontal justifyContent="space-between" p={3}>
      {Left && isFunctionalComponent(Left) ? (
        <Left />
      ) : (
        <Box justifyContent="center" mr={3}>
          {Left}
        </Box>
      )}

      {Main && isFunctionalComponent(Main) ? (
        <Main />
      ) : (
        <Box flex={1} justifyContent="center">
          {Main}
        </Box>
      )}

      {Right && isFunctionalComponent(Right) ? (
        <Right />
      ) : (
        <Box justifyContent="center">{Right}</Box>
      )}
    </Box>
  </Card>
);
