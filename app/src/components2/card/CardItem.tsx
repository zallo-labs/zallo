import { FC, ReactNode } from 'react';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { ItemSkeleton } from '@components/list/ItemSkeleton';
import { isFunctionalComponent } from '@util/typing';
import { Card, CardProps } from './Card';

export interface CardItemProps extends CardProps {
  Left?: ReactNode | FC;
  Main?: ReactNode | FC;
  Right?: ReactNode | FC;
}

export const CardItem = withSkeleton(
  ({ Left, Main, Right, ...cardProps }: CardItemProps) => (
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
  ),
  (props) => <ItemSkeleton {...props} />,
);
