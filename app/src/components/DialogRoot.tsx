import { Dialog, DialogProps } from 'react-native-paper';
import { useGoBack } from './Appbar/useGoBack';
import { Box } from './layout/Box';

export interface DialogRootProps extends Omit<DialogProps, 'visible' | 'onDismiss' | 'theme'> {}

export const DialogRoot = (props: DialogRootProps) => (
  <Box flex={1} vertical center>
    <Dialog visible onDismiss={useGoBack()} {...props} />
  </Box>
);
