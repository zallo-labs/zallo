import { BackIcon, ContactsIcon, PasteIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { IconButton } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoBack } from '~/components/Appbar/useGoBack';
import BarcodeMask from 'react-native-barcode-mask';
import { View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSelectContact } from '../contacts/useSelectContact';

export interface OverlayProps {
  tryHandle: (data: string) => void;
}

export const Overlay = ({ tryHandle }: OverlayProps) => {
  const styles = useStyles(useSafeAreaInsets());
  const selectContact = useSelectContact();

  return (
    <View style={styles.root}>
      <BarcodeMask
        outerMaskOpacity={0.4}
        edgeColor={styles.maskEdge.color}
        edgeRadius={styles.maskEdge.borderRadius}
        showAnimatedLine={false}
      />

      <View style={styles.actionsContainer}>
        <IconButton icon={BackIcon} mode="contained-tonal" onPress={useGoBack()} />

        <View style={styles.spacer} />

        <IconButton
          icon={ContactsIcon}
          mode="contained-tonal"
          onPress={async () => tryHandle((await selectContact()).addr)}
        />

        <IconButton
          icon={PasteIcon}
          mode="contained-tonal"
          onPress={async () => tryHandle(await Clipboard.getStringAsync())}
        />
      </View>
    </View>
  );
};

const useStyles = makeStyles(({ colors, roundness }, insets: EdgeInsets) => ({
  root: {
    flex: 1,
  },
  maskEdge: {
    color: colors.primaryContainer,
    borderRadius: roundness,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    left: insets.left,
    flexDirection: 'row',
    margin: 16,
    marginRight: 16 + insets.right,
    gap: 16,
  },
  spacer: {
    flex: 1,
  },
}));
