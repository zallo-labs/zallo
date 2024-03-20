import { AuthSettings } from '#/shared/AuthSettings';

export default function AuthSettingsScreen() {
  return <AuthSettings appbarMenu passwordHref={`/(drawer)/settings/password`} />;
}

export { ErrorBoundary } from '#/ErrorBoundary';