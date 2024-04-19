import { BackIcon, ContactsIcon, PasteIcon } from '~/util/theme/icons';
import { IconButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { showWarning } from '#/provider/SnackbarProvider';
import { useSelectAddress } from '~/hooks/useSelectAddress';
import { useRouter } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';

export interface OverlayProps {
  onData: (data: string) => Promise<boolean>;
}

export function ScanOverlay({ onData }: OverlayProps) {
  const { styles } = useStyles(stylesheet);
  const selectAddress = useSelectAddress();

  return (
    <View style={styles.container}>
      <View style={styles.finderContainer}>
        <View style={styles.finder}>
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
          onPress={async () => {
            const address = await selectAddress({ include: ['accounts', 'contacts'] });
            if (address) onData(address);
          }}
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

const stylesheet = createStyles(({ colors }, { insets, screen }) => {
  const size = Math.min(screen.width / 1.5, screen.height / 1.5, 600);
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
      marginTop: insets.top + 8,
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
      alignItems: 'center',
      justifyContent: 'center',
      ...StyleSheet.absoluteFillObject,
    },
    finder: {
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
