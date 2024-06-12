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
import { useTransfer } from '~/hooks/useTransfer';
import { DrawerSurface } from '#/drawer/DrawerSurface';
import { Link, Stack } from 'expo-router';
import { AppbarHeader } from '#/Appbar/AppbarHeader';
import { DrawerLogo } from '#/drawer/DrawerLogo';
import { createStyles, useStyles } from '@theme/styles';
import { TouchableOpacity } from 'react-native';
import { useNavType } from '#/drawer/DrawerContextProvider';
import { Fab } from '#/Fab';
import { RailSurface } from '#/drawer/RailSurface';
import { RailItem } from '#/drawer/RailItem';

const Section = PaperDrawer.Section;

export const unstable_settings = {
  initialRouteName: `[account]/(home)`,
};

export default function DrawerLayout() {
  const { styles } = useStyles(stylesheet);
  const type = useNavType();

  return (
    <Drawer DrawerContent={DrawerContent} RailContent={RailContent}>
      <Stack
        screenOptions={{
          header: (props) => <AppbarHeader {...props} />,
          contentStyle: [styles.content, type === 'modal' && styles.modalPadding],
        }}
      />
    </Drawer>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  content: {
    backgroundColor: colors.surfaceContainer.low,
    paddingRight: {
      compact: 16,
      medium: 24,
    },
  },
  modalPadding: {
    paddingLeft: {
      compact: 16,
      medium: 24,
    },
  },
}));

function RailContent() {
  const { styles } = useStyles(railStylesheet);
  const account = useSelectedAccount();
  const transfer = useTransfer();

  return (
    <RailSurface
      fab={
        account && (
          <Fab
            mode="flat"
            position="relative"
            icon={() => <TransferIcon color={styles.fabIcon.color} />}
            style={styles.fabContainer}
            loading={false}
            onPress={() => transfer({ account })}
            animated={false}
          />
        )
      }
    >
      {account ? (
        <RailItem
          href={{ pathname: `/(drawer)/[account]/(home)/`, params: { account } }}
          icon={HomeIcon}
          label="Home"
        />
      ) : (
        <RailItem href={`/`} icon={HomeIcon} label="Home" />
      )}

      {account && (
        <RailItem
          href={{ pathname: `/(drawer)/[account]/swap`, params: { account } }}
          icon={SwapIcon}
          label="Swap"
        />
      )}

      {account && (
        <RailItem
          href={{ pathname: `/(modal)/[account]/receive`, params: { account } }}
          icon={QrCodeIcon}
          label="Receive"
        />
      )}

      {account && (
        <RailItem
          href={{ pathname: `/(drawer)/[account]/settings/`, params: { account } }}
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
  const transfer = useTransfer();

  return (
    <DrawerSurface>
      <Section>
        <Link href={{ pathname: '/', params: { redirect: 'false' } }} asChild>
          <TouchableOpacity>
            <DrawerLogo style={contentStyles.logo} />
          </TouchableOpacity>
        </Link>

        {account ? (
          <Item
            href={{ pathname: `/(drawer)/[account]/(home)/`, params: { account } }}
            icon={HomeIcon}
            label="Home"
          />
        ) : (
          <Item href={`/`} icon={HomeIcon} label="Home" />
        )}

        {account && (
          <Item
            href={{ pathname: `/(drawer)/[account]/transfer`, params: { account } }}
            icon={TransferIcon}
            label="Transfer"
            onPress={() => transfer({ account })}
          />
        )}

        {account && (
          <Item
            href={{ pathname: `/(drawer)/[account]/swap`, params: { account } }}
            icon={SwapIcon}
            label="Swap"
          />
        )}

        {account && (
          <Item
            href={{ pathname: `/(modal)/[account]/receive`, params: { account } }}
            icon={QrCodeIcon}
            label="Receive"
          />
        )}

        {account && (
          <Item
            href={{ pathname: `/(drawer)/[account]/settings/`, params: { account } }}
            icon={AccountIcon}
            label="Account"
          />
        )}
      </Section>

      <Section>
        <Item href={`/(drawer)/approvers`} icon={DevicesIcon} label="My approvers" />
        <Item href={`/(drawer)/contacts/`} icon={ContactsIcon} label="Contacts" />
        {account && (
          <Item
            href={{ pathname: `/(drawer)/[account]/tokens`, params: { account } }}
            icon={GenericTokenIcon}
            label="Tokens"
          />
        )}
        <Item href={`/(drawer)/sessions/`} icon={WalletConnectIcon} label="Sessions" />

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

const contentStyles = createStyles({
  logo: {
    marginBottom: 8,
  },
});
