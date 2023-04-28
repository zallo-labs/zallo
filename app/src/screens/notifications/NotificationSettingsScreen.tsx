import { ICON_SIZE } from '@theme/paper';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { persistedAtom } from '~/util/jotai';
import { useImmerAtom } from 'jotai-immer';
import * as Notifications from 'expo-notifications';
import type { NotificationChannelInput } from 'expo-notifications';
import { Switch } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { Button } from '~/components/Button';
import { ListItem } from '~/components/list/ListItem';
import { NotificationsOutlineIcon } from '@theme/icons';
import { useAtomValue } from 'jotai';

export type NotificationChannel = 'activity' | 'product';
export const NotificationChannelConfig: Record<NotificationChannel, NotificationChannelInput> = {
  activity: {
    name: 'activity',
    description: 'Account activity',
    importance: Notifications.AndroidImportance.MAX,
    showBadge: true,
    enableLights: true,
    enableVibrate: true,
  },
  product: {
    name: 'product',
    description: 'Product updates',
    importance: Notifications.AndroidImportance.DEFAULT,
  },
};

const NOTIFICATIONS_ATOM = persistedAtom<Record<NotificationChannel, boolean>>('Notifications', {
  activity: true,
  product: true,
});

export const useNotificationSettings = () => useAtomValue(NOTIFICATIONS_ATOM);

export interface NotificationSettingsParams {
  onboard?: boolean;
}

export type NotificationSettingsScreenProps = StackNavigatorScreenProps<'NotificationSettings'>;

export const NotificationSettingsScreen = withSuspense(
  ({ navigation, route }: NotificationSettingsScreenProps) => {
    const { onboard } = route.params;
    const [settings, update] = useImmerAtom(NOTIFICATIONS_ATOM);

    const [perm, requestPerm] = Notifications.usePermissions({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowProvisional: true,
        provideAppNotificationSettings: true,
      },
    });

    const next = onboard ? () => navigation.navigate('CreateAccount') : undefined;

    return (
      <Screen>
        <Appbar mode="small" leading="back" headline="" />

        <View style={styles.header}>
          <NotificationsOutlineIcon size={ICON_SIZE.medium} />

          <Text variant="headlineMedium" style={styles.text}>
            Notifications
          </Text>

          <Text style={styles.text}>
            Stay informed about important updates and activity on your account
          </Text>
        </View>

        <View>
          {Object.entries(NotificationChannelConfig).map(([channel, config]) => (
            <ListItem
              key={channel}
              headline={config.description}
              trailing={
                <Switch
                  value={settings[channel as NotificationChannel]}
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
