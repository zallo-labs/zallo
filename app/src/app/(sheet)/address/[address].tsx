import { useAddressLabel } from '#/address/AddressLabel';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { PressableOpacity } from '#/PressableOpacity';
import { Scrollable } from '#/Scrollable';
import { Sheet } from '#/sheet/Sheet';
import { ContactOutlineIcon, OutboundIcon, ShareIcon, WebIcon } from '@theme/icons';
import { CORNER, ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { CHAINS } from 'chains';
import { Link } from 'expo-router';
import { asAddress, asChain } from 'lib';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { share } from '~/lib/share';
import { zUAddress } from '~/lib/zod';

const Params = z.object({ address: zUAddress() });

export default function AddressSheet() {
  const { styles } = useStyles(stylesheet);
  const { address } = useLocalParams(Params);
  const account = useSelectedAccount();

  const explorer = CHAINS[asChain(address)].blockExplorers?.native.url;

  return (
    <Sheet contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <AddressIcon address={address} size={ICON_SIZE.large} />

        <Text variant="headlineSmall">{useAddressLabel(address)}</Text>

        <Text variant="bodyMedium" style={styles.address}>
          {asAddress(address)}
        </Text>
      </View>

      <Scrollable horizontal contentContainerStyle={styles.actions}>
        <PressableOpacity style={styles.action} onPress={() => share({ url: address })}>
          <ShareIcon />
          <Text variant="labelLarge">Share</Text>
        </PressableOpacity>

        {explorer && (
          <Link href={`${explorer}address/${asAddress(address)}`} asChild>
            <PressableOpacity style={styles.action}>
              <WebIcon />
              <Text variant="labelLarge">Explorer</Text>
            </PressableOpacity>
          </Link>
        )}

        <Link href={{ pathname: `/(nav)/contacts/[address]`, params: { address } }} asChild>
          <PressableOpacity style={styles.action}>
            <ContactOutlineIcon />
            <Text variant="labelLarge">Contact</Text>
          </PressableOpacity>
        </Link>

        {account && (
          <Link
            href={{ pathname: `/(nav)/[account]/(home)/send`, params: { account, to: address } }}
            asChild
          >
            <PressableOpacity style={styles.action}>
              <OutboundIcon />
              <Text variant="labelLarge">Send</Text>
            </PressableOpacity>
          </Link>
        )}
      </Scrollable>
    </Sheet>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    paddingBottom: 16,
  },
  headerContainer: {
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  address: {
    color: colors.onSurfaceVariant,
  },
  actions: {
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  action: {
    alignItems: 'center',
    gap: 8,
    width: 80,
    paddingVertical: 8,
    borderRadius: CORNER.m,
  },
}));
