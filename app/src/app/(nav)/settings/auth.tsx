import { Appbar } from '#/Appbar/Appbar';
import { AuthSettings } from '#/auth/AuthSettings';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { createStyles } from '@theme/styles';

function AuthSettingsScreen() {
  return (
    <>
      <Appbar mode="large" leading="menu" headline="Authentication" />

      <ScrollableScreenSurface contentContainerStyle={styles.surface}>
        <AuthSettings />
      </ScrollableScreenSurface>
    </>
  );
}

const styles = createStyles({
  surface: {
    flexGrow: 1,
    paddingTop: 8,
  },
});

export default withSuspense(AuthSettingsScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
