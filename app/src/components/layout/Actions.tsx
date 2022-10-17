import { ReactNode } from 'react';
import { Box } from './Box';

export interface ActionsProps {
  children?: ReactNode;
}

export const Actions = ({ children }: ActionsProps) => {
  return (
    <>
      <Box flex={1} />
      <Box horizontal justifyContent="space-between" alignItems="center" m={2}>
        {children}
      </Box>
    </>
  );
};
