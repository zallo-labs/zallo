import { Appbar } from '#/Appbar/Appbar';
import { AuthSettings } from '#/auth/AuthSettings';
import { Scrollable } from '#/Scrollable';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';

function AuthSettingsScreen() {
  return (
    <Scrollable>
      <Appbar mode="large" leading="menu" headline="Authentication" />
      <AuthSettings />
    </Scrollable>
  );
}

export default withSuspense(AuthSettingsScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
