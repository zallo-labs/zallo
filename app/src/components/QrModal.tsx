import QRCode from 'react-native-qrcode-svg';
import { Address, UAddress, asAddress, asChain, isUAddress } from 'lib';
import { IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, ArrowDropDownIcon, ShareIcon, materialCommunityIcon } from '@theme/icons';
import { Actions } from '#/layout/Actions';
import { View } from 'react-native';
import { AddressLabel } from '#/address/AddressLabel';
import { Blur } from '#/Blur';
import { Button } from '#/Button';
import { share } from '~/lib/share';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
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
      <View style={styles.container}>
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
                  chipProps={{ elevated: true, mode: 'outlined', closeIcon: ArrowDropDownIcon }}
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
              size={styles.qr.fontSize}
              backgroundColor="transparent"
              ecl="L"
            />
          </Surface>
        </View>

        <Actions flex={false} style={styles.actions}>
          {actions}

          <Button mode="contained" icon={ShareIcon} onPress={() => share({ url: address })}>
            Share
          </Button>
        </Actions>
      </View>
    </Blur>
  );
}

const stylesheet = createStyles(({ colors, iconSize, corner }, { insets, screen }) => ({
  container: {
    flex: 1,
    marginTop: insets.top,
  },
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
    padding: 32,
    borderRadius: corner.m,
    backgroundColor: colors.primaryContainer,
  },
  qr: {
    fontSize: Math.min(screen.width * 0.8, screen.height * 0.6, 1024 - 96),
    color: colors.onPrimaryContainer,
  },
  actions: {
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
  },
}));
