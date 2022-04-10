import { ReactNode } from 'react';
import { Box, BoxProps } from './Box';

export interface ListItemProps extends BoxProps {
  Left?: ReactNode;
  Main?: ReactNode;
  InnerRight?: ReactNode;
  Right?: ReactNode;
}

export const ListItem = ({ Left, Main, InnerRight, Right, ...boxProps }: ListItemProps) => (
  <Box horizontal justifyContent="space-between" alignItems="center" {...boxProps}>
    <Box horizontal justifyContent="flex-start" minWidth="40%">
      {Left && <Box mr={2}>{Left}</Box>}
      {Main}
    </Box>

    {InnerRight}
    {Right}
  </Box>
);
