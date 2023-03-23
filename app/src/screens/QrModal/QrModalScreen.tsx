import QRCode from 'react-native-qrcode-svg';
import { Address } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { Screen } from '~/components/layout/Screen';
import { makeStyles } from '@theme/makeStyles';
import { Button, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { CloseIcon, ShareIcon } from '@theme/icons';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet, Share, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { AddressLabel } from '~/components/addr/AddressLabel';
import { buildAddressLink } from '~/util/addressLink';

export interface QrModalScreenParams {
  address: Address;
}

export type QrModalScreenProps = StackNavigatorScreenProps<'QrModal'>;

export const QrModalScreen = ({ route, navigation: { goBack } }: QrModalScreenProps) => {
  const { address } = route.params;
  const styles = uesStyles();
  const { dark } = useTheme();

  const share = () => {
    const link = buildAddressLink(address);
    Share.share({ url: link, message: link });
  };

  return (
    <BlurView blurAmount={16} blurType={dark ? 'light' : 'dark'} style={StyleSheet.absoluteFill}>
      <Screen>
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
    </BlurView>
  );
};

const uesStyles = makeStyles(({ colors, window }) => ({
  close: {
    margin: 16,
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
