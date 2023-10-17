import { Surface, SurfaceProps } from 'react-native-paper';
import { ScrollView } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
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
import { DrawerType, useDrawerContext } from './DrawerContextProvider';
import { DrawerItem as Item } from './DrawerItem';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { Image } from 'expo-image';
import { ETH_ICON_URI } from '~/components/token/TokenIcon';
import { CONFIG } from '~/util/config';
import { UserHeader } from '~/components/drawer/UserHeader';
import { useTransfer } from '~/hooks/useTransfer';

const Section = PaperDrawer.Section;

const surfaceTypeProps: Record<DrawerType, Partial<SurfaceProps>> = {
  standard: { mode: 'flat', elevation: 0 },
  modal: { mode: 'elevated', elevation: 1 },
};

export interface DrawerContentProps {}

export function DrawerContent() {
  const styles = useStyles();
  const { type } = useDrawerContext();
  const account = useSelectedAccount();
  const transfer = useTransfer();

  return (
    <Surface {...surfaceTypeProps[type]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Section>
          <UserHeader />

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
          <Item href={`/settings/auth`} icon={FingerprintIcon} label="Auth" />
          <Item href={`/settings/notifications`} icon={NotificationsIcon} label="Notifications" />
        </Section>

        <Section title="Contact us" showDivider={false}>
          <Item href={CONFIG.metadata.twitter} icon={TwitterIcon} label="Twitter" />
          <Item href={CONFIG.metadata.github} icon={GithubIcon} label="GitHub" />
        </Section>
      </ScrollView>
    </Surface>
  );
}

const useStyles = makeStyles(({ corner, insets, iconSize }) => ({
  container: {
    flex: 1,
    borderTopRightRadius: corner.l,
    borderBottomRightRadius: corner.l,
  },
  contentContainer: {
    paddingTop: insets.top + 12,
    paddingBottom: insets.bottom,
  },
  icon: {
    width: iconSize.small,
    height: iconSize.small,
  },
}));
