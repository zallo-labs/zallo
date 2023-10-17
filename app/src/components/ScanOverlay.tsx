import { BackIcon, ContactsIcon, PasteIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { IconButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { showWarning } from '~/components/provider/SnackbarProvider';
import { useSelectAddress } from '~/hooks/useSelectAddress';
import { Rect, useSafeAreaFrame } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export interface OverlayProps {
  onData: (data: string) => Promise<boolean>;
}

export function ScanOverlay({ onData }: OverlayProps) {
  const styles = useStyles({ area: useSafeAreaFrame() });
  const selectAddress = useSelectAddress();

  return (
    <View style={styles.container}>
      <View
        style={{ alignItems: 'center', justifyContent: 'center', ...StyleSheet.absoluteFillObject }}
      >
        <View style={styles.finderContainer}>
          <View style={styles.finderTopLeft} />
          <View style={styles.finderTopRight} />
          <View style={styles.finderBottomLeft} />
          <View style={styles.finderBottomRight} />
        </View>
      </View>

      <View style={styles.actions}>
        <IconButton icon={BackIcon} mode="contained-tonal" onPress={useRouter().back} />

        <View style={styles.spacer} />

        <IconButton
          icon={ContactsIcon}
          mode="contained-tonal"
          onPress={async () => onData(await selectAddress({ include: ['accounts', 'contacts'] }))}
        />

        <IconButton
          icon={PasteIcon}
          mode="contained-tonal"
          onPress={async () => {
            const data = await Clipboard.getStringAsync();
            const handled = await onData(data);
            if (!handled) showWarning("Data doesn't match any known formats");
          }}
        />
      </View>
    </View>
  );
}

interface StyleProps {
  area: Rect;
}

const useStyles = makeStyles(({ colors, insets }, { area }: StyleProps) => {
  const size = Math.min(area.width / 1.5, area.height / 1.5, 600);
  const finderWidth = 8;
  const finderRadius = size * 0.08;

  const finderBorder = {
    position: 'absolute',
    width: size * 0.15,
    height: size * 0.15,
    borderColor: colors.primaryContainer,
  } as const;

  return {
    container: {
      flex: 1,
      marginTop: insets.top,
    },
    actions: {
      flexDirection: 'row',
      marginHorizontal: 16,
      gap: 16,
    },
    spacer: {
      flex: 1,
    },
    finderContainer: {
      width: size,
      height: size,
    },
    finderTopLeft: {
      ...finderBorder,
      top: 0,
      left: 0,
      borderLeftWidth: finderWidth,
      borderTopWidth: finderWidth,
      borderTopLeftRadius: finderRadius,
    },
    finderTopRight: {
      ...finderBorder,
      top: 0,
      right: 0,
      borderRightWidth: finderWidth,
      borderTopWidth: finderWidth,
      borderTopRightRadius: finderRadius,
    },
    finderBottomLeft: {
      ...finderBorder,
      bottom: 0,
      left: 0,
      borderLeftWidth: finderWidth,
      borderBottomWidth: finderWidth,
      borderBottomLeftRadius: finderRadius,
    },
    finderBottomRight: {
      ...finderBorder,
      bottom: 0,
      right: 0,
      borderRightWidth: finderWidth,
      borderBottomWidth: finderWidth,
      borderBottomRightRadius: finderRadius,
    },
  };
});
