import { ReactNode } from 'react';
import { Box, BoxProps } from './Box';

export interface ListItemProps extends BoxProps {
  Left?: ReactNode;
  Main?: ReactNode;
  Right?: ReactNode;
}

export const ListItem = ({ Left, Main, Right, ...boxProps }: ListItemProps) => (
  <Box horizontal justifyContent="space-between" alignItems="center" {...boxProps}>
    <Box horizontal justifyContent="flex-start" alignItems="center">
      {Left && <Box mr={2}>{Left}</Box>}
      {Main}
    </Box>

    {Right}
  </Box>
);
