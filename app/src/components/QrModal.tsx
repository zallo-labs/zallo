import { ReactNode } from 'react';
import { ScaledSize, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, Surface, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Address, isUAddress, UAddress } from 'lib';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Blur } from '~/components/Blur';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { share } from '~/lib/share';
import { truncateAddr } from '~/util/format';
import { CloseIcon, ShareIcon } from '~/util/theme/icons';
import { createStyles, useStyles } from '~/util/theme/styles';

export interface QrModalProps {
  address: Address | UAddress;
  actions?: ReactNode;
}

export function QrModal({ address, actions }: QrModalProps) {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();

  return (
    <Blur>
      <View style={styles.container(useSafeAreaInsets())}>
        <IconButton
          mode="contained-tonal"
          icon={CloseIcon}
          style={styles.close}
          onPress={router.back}
        />

        <View style={styles.headerContainer}>
          <Text variant="displaySmall" style={styles.name}>
            {isUAddress(address) ? <AddressLabel address={address} /> : truncateAddr(address)}
          </Text>
        </View>

        <View style={styles.qrContainer}>
          <Surface style={styles.qrSurface}>
            <QRCode
              value={address}
              color={styles.qr.color}
              size={styles.qrSize(useWindowDimensions()).fontSize}
              backgroundColor="transparent"
              ecl="M"
              enableLinearGradient
              linearGradient={[styles.primary.color, styles.tertiary.color]}
            />
          </Surface>
        </View>

        <Actions>
          {actions}

          <Button mode="contained" icon={ShareIcon} onPress={() => share({ url: address })}>
            Share
          </Button>
        </Actions>
      </View>
    </Blur>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: (insets: EdgeInsets) => ({
    flex: 1,
    marginTop: insets.top,
  }),
  close: {
    marginHorizontal: 16,
  },
  name: {
    textAlign: 'center',
    color: colors.onScrim,
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 32,
  },
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  qrSurface: {
    padding: 16,
    borderRadius: 16,
  },
  qrSize: (window: ScaledSize) => ({
    fontSize: {
      compact: Math.min(window.width * 0.8, window.height * 0.8),
      medium: Math.min(window.width * 0.7, window.height * 0.7),
      expanded: Math.min(window.width * 0.5, window.height * 0.5),
    },
  }),
  qr: {
    color: colors.onSurface,
  },
  primary: {
    color: colors.primary,
  },
  tertiary: {
    color: colors.tertiary,
  },
  requestButton: {
    color: colors.inverseOnSurface,
  },
}));
