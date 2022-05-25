import { ReactNode } from 'react';
import { Box, BoxProps } from './Box';

export interface HeaderProps extends BoxProps {
  Left?: ReactNode;
  Middle?: React.ReactNode;
  Right?: React.ReactNode;
}

export const Header = ({ Left, Middle, Right, ...boxProps }: HeaderProps) => (
  <Box horizontal alignItems="center" {...boxProps}>
    <Box flex={1} horizontal justifyContent="flex-start" alignItems="center">
      {Left}
    </Box>

    <Box flex={4}>{Middle}</Box>

    <Box flex={1} horizontal justifyContent="flex-end" alignItems="center">
      {Right}
    </Box>
  </Box>
);
