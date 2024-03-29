import QRCode from 'react-native-qrcode-svg';
import { Address, UAddress, asAddress, asChain, isUAddress } from 'lib';
import { IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, DownArrowIcon, ShareIcon, materialCommunityIcon } from '@theme/icons';
import { Actions } from '#/layout/Actions';
import { ScaledSize, View, useWindowDimensions } from 'react-native';
import { AddressLabel } from '#/address/AddressLabel';
import { Blur } from '#/Blur';
import { Button } from '#/Button';
import { share } from '~/lib/share';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactNode, useState } from 'react';
import { SelectChip } from './fields/SelectChip';
import { CHAINS } from 'chains';
import { ChainIcon } from './Identicon/ChainIcon';

const UniqueAddressIcon = materialCommunityIcon('web');

export interface QrModalProps {
  address: Address | UAddress;
  actions?: ReactNode;
}

export function QrModal({ address, actions }: QrModalProps) {
  const { styles } = useStyles(stylesheet);

  const [mode, setMode] = useState<'address' | 'uaddress'>('address');
  const displayed = mode === 'address' ? asAddress(address) : address;
  const chain = isUAddress(address) && asChain(address);

  return (
    <Blur>
      <View style={styles.container(useSafeAreaInsets())}>
        <View style={styles.headerContainer}>
          <Link href=".." asChild>
            <IconButton mode="contained-tonal" icon={CloseIcon} size={styles.iconButton.width} />
          </Link>

          <Text variant="displaySmall" style={styles.name}>
            {isUAddress(address) && <AddressLabel address={address} />}
          </Text>

          <View style={styles.iconButton} />
        </View>

        <View style={styles.contentContainer}>
          {chain && (
            <View style={styles.modeContainer}>
              <View style={styles.modeSelectorContainer}>
                <SelectChip
                  entries={[
                    {
                      icon: (props) => <ChainIcon chain={chain} {...props} />,
                      title: `${CHAINS[chain].name} address`,
                      value: 'address' as const,
                    },
                    {
                      icon: UniqueAddressIcon,
                      title: 'Unique address',
                      value: 'uaddress' as const,
                    },
                  ]}
                  value={mode}
                  chipProps={{ elevated: true, mode: 'outlined', closeIcon: DownArrowIcon }}
                  onChange={(v) => setMode(v)}
                />
              </View>

              <Text variant="bodyLarge" style={styles.address}>
                {mode === 'address' ? asAddress(address) : address}
              </Text>
            </View>
          )}

          <Surface style={styles.qrSurface}>
            <QRCode
              value={displayed}
              color={styles.qr.color}
              size={styles.qrSize(useWindowDimensions()).fontSize}
              backgroundColor="transparent"
              ecl="M"
              enableLinearGradient
              linearGradient={[styles.primary.color, styles.tertiary.color]}
            />
          </Surface>
        </View>

        <Actions flex={false}>
          {actions}

          <Button mode="contained" icon={ShareIcon} onPress={() => share({ url: address })}>
            Share
          </Button>
        </Actions>
      </View>
    </Blur>
  );
}

const stylesheet = createStyles(({ colors, iconSize }) => ({
  container: (insets: EdgeInsets) => ({
    flex: 1,
    marginTop: insets.top,
  }),
  iconButton: {
    width: iconSize.small,
  },
  name: {
    flex: 1,
    textAlign: 'center',
    color: colors.onScrim,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 8,
  },
  modeContainer: {
    gap: 16,
  },
  modeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  address: {
    color: colors.inverseOnSurface,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginHorizontal: 32,
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
