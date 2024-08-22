import QRCode from 'react-native-qrcode-svg';
import { Address, UAddress, asAddress, asChain, isUAddress } from 'lib';
import { IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, ShareIcon } from '@theme/icons';
import { Actions } from '#/layout/Actions';
import { View } from 'react-native';
import { AddressLabel } from '#/address/AddressLabel';
import { Blur } from '#/Blur';
import { Button } from '#/Button';
import { share } from '~/lib/share';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { ReactNode, useState } from 'react';
import { CHAINS } from 'chains';
import { ChainIcon } from './Identicon/ChainIcon';
import { Chip } from './Chip';

export interface QrModalProps {
  address: Address | UAddress;
  actions?: ReactNode;
}

export function QrModal({ address, actions }: QrModalProps) {
  const { styles } = useStyles(stylesheet);

  const [type, setType] = useState<'cross-chain' | 'chain'>('cross-chain');
  const displayed = type === 'chain' ? asAddress(address) : address;
  const chain = isUAddress(address) && asChain(address);

  return (
    <Blur>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Link href=".." asChild>
            <IconButton mode="contained-tonal" icon={CloseIcon} size={styles.iconButton.width} />
          </Link>

          {isUAddress(address) && (
            <AddressLabel address={address} variant="displaySmall" style={styles.name} />
          )}

          <View style={styles.iconButton} />
        </View>

        <View style={styles.contentContainer}>
          {chain && (
            <View style={styles.modeContainer}>
              <View style={styles.modeSelectorContainer}>
                <Chip
                  mode={type === 'cross-chain' ? 'flat' : 'outlined'}
                  selected={type === 'cross-chain'}
                  onPress={() => setType('cross-chain')}
                >
                  Cross-chain
                </Chip>

                <Chip
                  mode={type === 'chain' ? 'flat' : 'outlined'}
                  icon={(props) => <ChainIcon chain={chain} {...props} />}
                  selected={type === 'chain'}
                  onPress={() => setType('chain')}
                >
                  {CHAINS[chain].name}
                </Chip>
              </View>
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

          <Text variant="titleLarge" style={styles.address}>
            {displayed}
          </Text>
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
    gap: 8,
  },
  address: {
    color: colors.inverseOnSurface,
    textAlign: 'center',
    maxWidth: Math.min(screen.width * 0.8, screen.height * 0.6, 1024 - 96),
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
  },
  qrSurface: {
    padding: 32,
    borderRadius: corner.m,
    backgroundColor: colors.primaryContainer,
  },
  qr: {
    fontSize: Math.min(screen.width * 0.8, screen.height * 0.6, 1024 - 96) - 32,
    color: colors.onPrimaryContainer,
  },
  actions: {
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
  },
}));
