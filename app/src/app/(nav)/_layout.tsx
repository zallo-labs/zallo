import { Drawer } from '#/drawer/Drawer';
import { Drawer as PaperDrawer } from 'react-native-paper';
import {
  ContactsIcon,
  FingerprintIcon,
  NotificationsIcon,
  OutboundIcon,
  SwapIcon,
  HomeIcon,
  WalletConnectIcon,
  TwitterIcon,
  GithubIcon,
  GenericTokenIcon,
  AccountIcon,
  ReceiveIcon,
} from '@theme/icons';
import { DrawerItem as Item } from '#/drawer/DrawerItem';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { CONFIG } from '~/util/config';
import { useSend } from '~/hooks/useSend';
import { DrawerSurface } from '#/drawer/DrawerSurface';
import { Link, Stack } from 'expo-router';
import { AppbarHeader } from '#/Appbar/AppbarHeader';
import { DrawerLogo } from '#/drawer/DrawerLogo';
import { createStyles, useStyles } from '@theme/styles';
import { PressableOpacity } from '#/PressableOpacity';
import { Fab } from '#/Fab';
import { RailSurface } from '#/drawer/RailSurface';
import { RailItem } from '#/drawer/RailItem';

const Section = PaperDrawer.Section;

export const unstable_settings = {
  initialRouteName: `[account]/(home)`,
};

export default function DrawerLayout() {
  return (
    <Drawer DrawerContent={DrawerContent} RailContent={RailContent}>
      <Stack screenOptions={{ header: (props) => <AppbarHeader {...props} /> }} />
    </Drawer>
  );
}

function RailContent() {
  const { styles } = useStyles(railStylesheet);
  const account = useSelectedAccount();
  const send = useSend();

  return (
    <RailSurface
      fab={
        account && (
          <Fab
            mode="flat"
            position="relative"
            icon={() => <OutboundIcon color={styles.fabIcon.color} />}
            style={styles.fabContainer}
            loading={false}
            onPress={() => send({ account })}
            animated={false}
          />
        )
      }
    >
      {account ? (
        <RailItem
          href={{ pathname: `/(nav)/[account]/(home)/`, params: { account } }}
          icon={HomeIcon}
          label="Home"
        />
      ) : (
        <RailItem href={`/`} icon={HomeIcon} label="Home" />
      )}

      {account && (
        <RailItem
          href={{ pathname: `/(nav)/[account]/swap`, params: { account } }}
          icon={SwapIcon}
          label="Swap"
        />
      )}

      {account && (
        <RailItem
          href={{ pathname: `/(modal)/[account]/receive`, params: { account } }}
          icon={ReceiveIcon}
          label="Receive"
        />
      )}

      {account && (
        <RailItem
          href={{ pathname: `/(nav)/[account]/settings/`, params: { account } }}
          icon={AccountIcon}
          label="Account"
        />
      )}
    </RailSurface>
  );
}

const railStylesheet = createStyles(({ colors }) => ({
  fabContainer: {
    backgroundColor: colors.tertiary,
  },
  fabIcon: {
    color: colors.onTertiary,
  },
}));

function DrawerContent() {
  const account = useSelectedAccount();
  const send = useSend();

  return (
    <DrawerSurface>
      <Section>
        <Link href={{ pathname: '/', params: { redirect: 'false' } }} asChild>
          <PressableOpacity noHover>
            <DrawerLogo style={contentStyles.logo} />
          </PressableOpacity>
        </Link>

        {account ? (
          <Item
            href={{ pathname: `/(nav)/[account]/(home)/`, params: { account } }}
            icon={HomeIcon}
            label="Home"
          />
        ) : (
          <Item href={`/`} icon={HomeIcon} label="Home" />
        )}

        {account && (
          <Item
            href={{ pathname: `/(nav)/[account]/send`, params: { account } }}
            icon={OutboundIcon}
            label="Send"
            onPress={() => send({ account })}
          />
        )}

        {account && (
          <Item
            href={{ pathname: `/(nav)/[account]/swap`, params: { account } }}
            icon={SwapIcon}
            label="Swap"
          />
        )}

        {account && (
          <Item
            href={{ pathname: `/(modal)/[account]/receive`, params: { account } }}
            icon={ReceiveIcon}
            label="Receive"
          />
        )}

        {account && (
          <Item
            href={{ pathname: `/(nav)/[account]/settings/`, params: { account } }}
            icon={AccountIcon}
            label="Account"
          />
        )}
      </Section>

      <Section>
        <Item href={`/(nav)/contacts/`} icon={ContactsIcon} label="Contacts" />
        {account && (
          <Item
            href={{ pathname: `/(nav)/[account]/tokens`, params: { account } }}
            icon={GenericTokenIcon}
            label="Tokens"
          />
        )}
        <Item href={`/(nav)/sessions/`} icon={WalletConnectIcon} label="Sessions" />

        <Item href={`/(nav)/settings/auth`} icon={FingerprintIcon} label="Auth" />
        <Item
          href={`/(nav)/settings/notifications`}
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

const contentStyles = createStyles({
  logo: {
    marginBottom: 8,
  },
});
