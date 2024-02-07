import { Drawer } from '#/drawer/Drawer';
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
  QrCodeIcon,
  GenericTokenIcon,
  DevicesIcon,
  AccountIcon,
} from '@theme/icons';
import { DrawerItem as Item } from '#/drawer/DrawerItem';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { CONFIG } from '~/util/config';
import { AccountDrawerHeader } from '#/drawer/AccountDrawerHeader';
import { useTransfer } from '~/hooks/useTransfer';
import { DrawerSurface } from '#/drawer/DrawerSurface';

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
            href={{ pathname: `/(modal)/[account]/receive`, params: { account } }}
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
            href={{ pathname: `/(drawer)/[account]/settings`, params: { account } }}
            icon={AccountIcon}
            label="Account"
          />
        )}
        <Item href={`/(drawer)/approvers`} icon={DevicesIcon} label="My approvers" />
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
