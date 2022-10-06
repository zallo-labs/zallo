import { BackIcon, PasteIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { IconButton } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoBack } from '~/components/Appbar/useGoBack';
import BarcodeMask from 'react-native-barcode-mask';
import { useTheme } from '@theme/paper';
import { SafeAreaView } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export interface OverlayProps {
  handleScanned: (data: string) => void;
}

export const Overlay = ({ handleScanned }: OverlayProps) => {
  const styles = useStyles(useSafeAreaInsets());
  const { colors, roundness } = useTheme();

  return (
    <SafeAreaView style={styles.root}>
      <BarcodeMask
        outerMaskOpacity={0.4}
        edgeRadius={roundness}
        edgeColor={colors.onBackground}
        showAnimatedLine={false}
      />

      <IconButton
        icon={BackIcon}
        mode="contained-tonal"
        style={styles.back}
        onPress={useGoBack()}
      />

      <IconButton
        icon={PasteIcon}
        mode="contained-tonal"
        style={styles.paste}
        onPress={async () => handleScanned(await Clipboard.getStringAsync())}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles(({ space }, accountArea: EdgeInsets) => ({
  root: {
    flex: 1,
  },
  back: {
    position: 'absolute',
    top: accountArea.top,
    left: accountArea.left,
    margin: space(2),
  },
  paste: {
    position: 'absolute',
    top: accountArea.top,
    right: accountArea.right,
    margin: space(2),
  },
}));
