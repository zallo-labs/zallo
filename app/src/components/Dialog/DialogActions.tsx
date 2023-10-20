import { StyleSheet } from 'react-native';
import { Dialog, DialogActionsProps } from 'react-native-paper';

export type { DialogActionsProps };

export function DialogActions(props: DialogActionsProps) {
  return <Dialog.Actions {...props} style={[styles.container, props.style]} />;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
});
