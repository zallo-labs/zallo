import { BackIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { IconButton } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoBack } from '~/components/Appbar/useGoBack';
import BarcodeMask from 'react-native-barcode-mask';
import { useTheme } from '@theme/paper';
import { SafeAreaView } from 'react-native';

export const Overlay = () => {
  const styles = useStyles(useSafeAreaInsets());
  const { colors, roundness } = useTheme();

  return (
    <SafeAreaView style={styles.root}>
      <BarcodeMask
        outerMaskOpacity={0.8}
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
    margin: space(3),
  },
}));
