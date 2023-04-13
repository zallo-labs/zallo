import { Dialog, DialogProps } from 'react-native-paper';
import { Box } from './layout/Box';
import { useNavigation } from '@react-navigation/native';

export interface DialogRootProps extends Omit<DialogProps, 'visible' | 'onDismiss' | 'theme'> {}

export const DialogRoot = (props: DialogRootProps) => (
  <Box flex={1} vertical center>
    <Dialog visible onDismiss={useNavigation().goBack} {...props} />
  </Box>
);
