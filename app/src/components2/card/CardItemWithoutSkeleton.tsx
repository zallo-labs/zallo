import { FC, ReactNode } from 'react';
import { Box } from '@components/Box';
import { isFunctionalComponent } from '@util/typing';
import { Card, CardProps } from './Card';
import { withKeys } from '@util/children';

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
  <Card p={3} {...cardProps}>
    <Box horizontal justifyContent="space-between">
      {Left &&
        (isFunctionalComponent(Left) ? (
          <Left />
        ) : (
          <Box justifyContent="center" mr={3}>
            {withKeys(Left)}
          </Box>
        ))}

      {Main &&
        (isFunctionalComponent(Main) ? (
          <Main />
        ) : (
          <Box flex={1} justifyContent="center">
            {withKeys(Main)}
          </Box>
        ))}

      {Right &&
        (isFunctionalComponent(Right) ? (
          <Right />
        ) : (
          <Box justifyContent="center" alignItems="flex-end">
            {withKeys(Right)}
          </Box>
        ))}
    </Box>
  </Card>
);
