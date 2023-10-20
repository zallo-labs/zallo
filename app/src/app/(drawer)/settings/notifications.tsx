import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import NotificationSettings from '~/components/shared/NotificationSettings';

export default function NotificationSettingsScreen() {
  return (
    <>
      <AppbarOptions leading="menu" />
      <NotificationSettings />
    </>
  );
}
