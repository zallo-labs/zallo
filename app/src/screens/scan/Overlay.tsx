import { BackIcon } from '@util/theme/icons';
import { makeStyles } from '@util/theme/makeStyles';
import { IconButton } from 'react-native-paper';
import {
  EdgeInsets,
  AccountAreaView,
  useAccountAreaInsets,
} from 'react-native-safe-area-context';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import BarcodeMask from 'react-native-barcode-mask';
import { useTheme } from '@util/theme/paper';

export const Overlay = () => {
  const styles = useStyles(useAccountAreaInsets());
  const { colors, roundness } = useTheme();

  return (
    <AccountAreaView style={styles.root}>
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
    </AccountAreaView>
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
