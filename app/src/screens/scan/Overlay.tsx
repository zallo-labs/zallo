import { BackIcon, ContactsIcon, PasteIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { IconButton } from 'react-native-paper';
import BarcodeMask from 'react-native-barcode-mask';
import { View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSelectContact } from '../contacts/useSelectContact';
import { useNavigation } from '@react-navigation/native';
import { showWarning } from '~/provider/SnackbarProvider';
import { Screen } from '~/components/layout/Screen';

export interface OverlayProps {
  onData: (data: string) => Promise<boolean>;
}

export const Overlay = ({ onData }: OverlayProps) => {
  const styles = useStyles();
  const selectContact = useSelectContact();

  return (
    <Screen topInset>
      <BarcodeMask
        outerMaskOpacity={0.4}
        edgeColor={styles.maskEdge.color}
        edgeRadius={styles.maskEdge.borderRadius}
        showAnimatedLine={false}
      />

      <View style={styles.actions}>
        <IconButton icon={BackIcon} mode="contained-tonal" onPress={useNavigation().goBack} />

        <View style={styles.spacer} />

        <IconButton
          icon={ContactsIcon}
          mode="contained-tonal"
          onPress={async () => onData((await selectContact({})).address)}
        />

        <IconButton
          icon={PasteIcon}
          mode="contained-tonal"
          onPress={async () => {
            const data = await Clipboard.getStringAsync();
            const handled = await onData(data);
            if (!handled) showWarning('No handler found for data');
          }}
        />
      </View>
    </Screen>
  );
};

const useStyles = makeStyles(({ colors, roundness }) => ({
  root: {
    flex: 1,
  },
  maskEdge: {
    color: colors.primaryContainer,
    borderRadius: roundness,
  },
  actions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 16,
  },
  spacer: {
    flex: 1,
  },
}));
