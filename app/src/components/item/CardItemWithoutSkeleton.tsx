import { FC, ReactNode } from 'react';
import { Box } from '~/components/layout/Box';
import { isFunctionalComponent } from '~/util/typing';
import { Item } from './Item';
import { withKeys } from '~/util/children';

export interface ItemWithoutSkeletonProps {
  Left?: ReactNode | FC;
  Main?: ReactNode | FC;
  Right?: ReactNode | FC;
}

export const ItemWithoutSkeleton = ({
  Left,
  Main,
  Right,
}: ItemWithoutSkeletonProps) => (
  <Box horizontal justifyContent="space-between">
    {Left &&
      (isFunctionalComponent(Left) ? (
        <Left />
      ) : (
        <Box justifyContent="center" mr={2}>
          {withKeys(Left)}
        </Box>
      ))}

    {Main &&
      (isFunctionalComponent(Main) ? (
        <Main />
      ) : (
        <Box flex={1} vertical justifyContent="space-around">
          {withKeys(Main)}
        </Box>
      ))}

    {Right &&
      (isFunctionalComponent(Right) ? (
        <Right />
      ) : (
        <Box vertical justifyContent="space-around" alignItems="flex-end">
          {withKeys(Right)}
        </Box>
      ))}
  </Box>
);
