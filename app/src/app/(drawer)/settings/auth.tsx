import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { AuthSettings } from '~/components/AuthSettings';

export default function AuthSettingsScreen() {
  return (
    <>
      <AppbarOptions leading="menu" />
      <AuthSettings />
    </>
  );
}
