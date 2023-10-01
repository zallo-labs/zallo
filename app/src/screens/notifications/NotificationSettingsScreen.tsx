import { ICON_SIZE } from '@theme/paper';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { persistedAtom } from '~/util/persistedAtom';
import { useImmerAtom } from 'jotai-immer';
import * as Notifications from 'expo-notifications';
import type { NotificationChannelInput } from 'expo-notifications';
import { Switch } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { Button } from '~/components/Button';
import { ListItem } from '~/components/list/ListItem';
import { NotificationsOutlineIcon } from '@theme/icons';
import { useAtomValue } from 'jotai';
import { ListHeader } from '~/components/list/ListHeader';
import { useNavigateToCreateAccountOnboardScreen } from '../create-account/useNavigateToCreateAccountOnboardScreen';

export type NotificationChannel = 'product' | 'activity' | 'transfers';
export const NotificationChannelConfig: Record<NotificationChannel, NotificationChannelInput> = {
  product: {
    name: 'Product updates',
    description: 'New features and announcements',
    importance: Notifications.AndroidImportance.DEFAULT,
  },
  transfers: {
    name: 'Transfers',
    description: 'Receipt of tokens and spending allowances',
    importance: Notifications.AndroidImportance.DEFAULT,
    showBadge: false,
    enableLights: false,
    enableVibrate: false,
  },
  activity: {
    name: 'Account activity',
    description: '',
    importance: Notifications.AndroidImportance.MAX,
    showBadge: true,
    enableLights: true,
    enableVibrate: true,
  },
};

const DEFAULT_SETTINGS: Record<NotificationChannel, boolean> = {
  activity: true,
  product: true,
  transfers: true,
};

const NOTIFICATIONS_ATOM = persistedAtom<Partial<Record<NotificationChannel, boolean>>>(
  'Notifications',
  DEFAULT_SETTINGS,
);

export const useNotificationSettings = () => ({
  ...DEFAULT_SETTINGS,
  ...useAtomValue(NOTIFICATIONS_ATOM),
});

export interface NotificationSettingsParams {
  isOnboarding?: boolean;
}

export type NotificationSettingsScreenProps = StackNavigatorScreenProps<'NotificationSettings'>;

export const NotificationSettingsScreen = withSuspense(
  ({ route }: NotificationSettingsScreenProps) => {
    const { isOnboarding } = route.params;
    const [settings, update] = useImmerAtom(NOTIFICATIONS_ATOM);
    const navigateToCreateAccountOnboarding = useNavigateToCreateAccountOnboardScreen();
    const next = isOnboarding ? navigateToCreateAccountOnboarding : undefined;

    const [perm, requestPerm] = Notifications.usePermissions({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowProvisional: true,
        provideAppNotificationSettings: true,
      },
    });

    return (
      <Screen>
        <Appbar mode="small" leading="back" headline="" />

        <View style={styles.header}>
          <NotificationsOutlineIcon size={ICON_SIZE.medium} />

          <Text variant="headlineMedium" style={styles.text}>
            Notifications
          </Text>
        </View>

        <View>
          <ListHeader>Receive notifications for</ListHeader>

          {Object.entries(NotificationChannelConfig).map(([channel, config]) => (
            <ListItem
              key={channel}
              headline={config.name}
              supporting={config.description}
              trailing={
                <Switch
                  value={settings[channel as NotificationChannel] ?? true}
                  onValueChange={(v) =>
                    update((s) => {
                      s[channel as NotificationChannel] = v;
                    })
                  }
                />
              }
            />
          ))}
        </View>

        <Actions>
          {!perm?.granted && next && <Button onPress={next}>Skip</Button>}

          {(!perm?.granted || next) && (
            <Button
              mode="contained"
              onPress={async () => {
                await requestPerm();
                next?.();
              }}
            >
              {perm?.granted ? 'Continue' : 'Enable'}
            </Button>
          )}
        </Actions>
      </Screen>
    );
  },
  ScreenSkeleton,
);

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 4,
    marginVertical: 32,
    marginHorizontal: 16,
  },
  text: {
    textAlign: 'center',
    marginBottom: 8,
  },
});
