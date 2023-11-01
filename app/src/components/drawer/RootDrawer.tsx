import { StyleSheet } from 'react-native';
import { Drawer as PaperDrawer } from 'react-native-paper';
import {
  ContactsIcon,
  FingerprintIcon,
  NotificationsIcon,
  TransferIcon,
  SwapIcon,
  HomeIcon,
  WalletConnectIcon,
  TwitterIcon,
  GithubIcon,
  PolicyIcon,
  QrCodeIcon,
} from '@theme/icons';
import { DrawerItem as Item } from './DrawerItem';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { Image } from 'expo-image';
import { ETH_ICON_URI } from '~/components/token/TokenIcon';
import { CONFIG } from '~/util/config';
import { AccountDrawerHeader } from '~/components/drawer/AccountDrawerHeader';
import { useTransfer } from '~/hooks/useTransfer';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerSurface } from './DrawerSurface';
import { ICON_SIZE } from '@theme/paper';

const Section = PaperDrawer.Section;

export interface RootDrawerProps extends DrawerContentComponentProps {}

export function RootDrawer(_props: RootDrawerProps) {
  const account = useSelectedAccount();
  const transfer = useTransfer();

  return (
    <DrawerSurface>
      <Section>
        <AccountDrawerHeader />

        {account ? (
          <Item
            href={{ pathname: `/(drawer)/[account]/(home)/`, params: { account } }}
            icon={HomeIcon}
            label="Home"
          />
        ) : (
          <Item href={`/`} icon={HomeIcon} label="Home" />
        )}

        <Item href={`/(drawer)/contacts/`} icon={ContactsIcon} label="Contacts" />
        <Item href={`/(drawer)/sessions/`} icon={WalletConnectIcon} label="Sessions" />

        {account && (
          <Item
            href={{ pathname: `/(drawer)/[account]/tokens`, params: { account } }}
            icon={() => <Image source={ETH_ICON_URI} style={styles.icon} />}
            label="Tokens"
          />
        )}
      </Section>

      {account && (
        <Section title="Actions">
          <Item
            href={{ pathname: `/(drawer)/[account]/transfer`, params: { account } }}
            icon={TransferIcon}
            label="Transfer"
            onPress={() => transfer({ account })}
          />

          <Item
            href={{ pathname: `/[account]/receive`, params: { account } }}
            icon={QrCodeIcon}
            label="Receive"
          />

          <Item
            href={{ pathname: `/(drawer)/[account]/swap`, params: { account } }}
            icon={SwapIcon}
            label="Swap"
          />
        </Section>
      )}

      <Section title="Settings">
        {account && (
          <Item
            href={{ pathname: `/(drawer)/[account]/policies/`, params: { account } }}
            icon={PolicyIcon}
            label="Policies"
          />
        )}
        <Item href={`/(drawer)/settings/auth`} icon={FingerprintIcon} label="Auth" />
        <Item
          href={`/(drawer)/settings/notifications`}
          icon={NotificationsIcon}
          label="Notifications"
        />
      </Section>

      <Section title="Contact us" showDivider={false}>
        <Item href={CONFIG.metadata.twitter} icon={TwitterIcon} label="Twitter" />
        <Item href={CONFIG.metadata.github} icon={GithubIcon} label="GitHub" />
      </Section>
    </DrawerSurface>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE.small,
    height: ICON_SIZE.small,
  },
});
