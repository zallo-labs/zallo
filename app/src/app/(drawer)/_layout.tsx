import { Drawer } from '~/components/drawer/Drawer';
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
  GenericTokenIcon,
  ApproversIcon,
} from '@theme/icons';
import { DrawerItem as Item } from '~/components/drawer/DrawerItem';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { CONFIG } from '~/util/config';
import { AccountDrawerHeader } from '~/components/drawer/AccountDrawerHeader';
import { useTransfer } from '~/hooks/useTransfer';
import { DrawerSurface } from '~/components/drawer/DrawerSurface';
import { ICON_SIZE } from '@theme/paper';

const Section = PaperDrawer.Section;

export const unstable_settings = {
  initialRouteName: `[account]/(home)`,
};

export default function DrawerLayout() {
  return <Drawer drawerContent={Content} />;
}

function Content() {
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
            icon={GenericTokenIcon}
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
        <Item href={`/(drawer)/approvers`} icon={ApproversIcon} label="My approvers" />
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
