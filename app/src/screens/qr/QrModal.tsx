import QRCode from 'react-native-qrcode-svg';
import { Address } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Screen } from '~/components/layout/Screen';
import { makeStyles } from '@theme/makeStyles';
import { Button, IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, ShareIcon } from '@theme/icons';
import { Actions } from '~/components/layout/Actions';
import { Share, View } from 'react-native';
import { AddressLabel } from '~/components/address/AddressLabel';
import { buildAddressLink } from '~/util/addressLink';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Blur } from '~/components/Blur';

export interface QrModalParams {
  address: Address;
}

export type QrModalProps = StackNavigatorScreenProps<'QrModal'>;

export const QrModal = withSuspense(({ route, navigation: { goBack } }: QrModalProps) => {
  const { address } = route.params;
  const styles = uesStyles();

  const share = () => {
    const link = buildAddressLink(address);
    Share.share({ url: link, message: link });
  };

  return (
    <Blur>
      <Screen topInset>
        <IconButton mode="contained-tonal" icon={CloseIcon} style={styles.close} onPress={goBack} />

        <View style={styles.qrContainer}>
          <Text variant="headlineLarge" style={styles.name}>
            <AddressLabel address={address} />
          </Text>

          <Surface style={styles.qrSurface}>
            <QRCode
              value={address}
              color={styles.qr.color}
              size={styles.qr.fontSize}
              backgroundColor="transparent"
              ecl="M"
              enableLinearGradient
              linearGradient={[styles.primary.color, styles.tertiary.color]}
            />
          </Surface>
        </View>

        <Actions>
          <Button mode="contained-tonal" icon={ShareIcon} onPress={share}>
            Share
          </Button>
        </Actions>
      </Screen>
    </Blur>
  );
}, Blur);

const uesStyles = makeStyles(({ colors, window }) => ({
  close: {
    marginHorizontal: 16,
  },
  name: {
    textAlign: 'center',
    color: colors.onScrim,
  },
  qrContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  qrSurface: {
    padding: 16,
    borderRadius: 16,
  },
  qr: {
    fontSize: window.width - 64,
    color: colors.onSurface,
  },
  primary: {
    color: colors.primary,
  },
  tertiary: {
    color: colors.tertiary,
  },
  button: {
    alignSelf: 'stretch',
  },
}));
