import { Drawer as PaperDrawer } from 'react-native-paper';

import { AccountDrawerHeader } from '~/components/drawer/AccountDrawerHeader';
import { Drawer } from '~/components/drawer/Drawer';
import { DrawerItem as Item } from '~/components/drawer/DrawerItem';
import { DrawerSurface } from '~/components/drawer/DrawerSurface';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { useTransfer } from '~/hooks/useTransfer';
import { CONFIG } from '~/util/config';
import {
  AccountIcon,
  ContactsIcon,
  DevicesIcon,
  FingerprintIcon,
  GenericTokenIcon,
  GithubIcon,
  HomeIcon,
  NotificationsIcon,
  QrCodeIcon,
  SwapIcon,
  TransferIcon,
  TwitterIcon,
  WalletConnectIcon,
} from '~/util/theme/icons';

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
