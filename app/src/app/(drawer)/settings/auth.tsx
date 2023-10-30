import { AuthSettings } from '~/components/shared/AuthSettings';

export default function AuthSettingsScreen() {
  return <AuthSettings appbarMenu passwordHref={`/(drawer)/settings/password`} />;
}
