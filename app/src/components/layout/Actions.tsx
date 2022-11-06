import { ReactNode } from 'react';
import { View } from 'react-native';
import { Box } from './Box';

export interface ActionsProps {
  primary?: ReactNode;
  secondary?: ReactNode;
}

export const Actions = ({ primary, secondary }: ActionsProps) => {
  return (
    <>
      <Box flex={1} />
      <Box horizontal justifyContent="space-between" alignItems="center" m={2}>
        {secondary ? secondary : <View />}
        {primary ? primary : <View />}
      </Box>
    </>
  );
};
