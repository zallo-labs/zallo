import { Appbar } from '#/Appbar/Appbar';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { NotificationSettings } from '#/NotificationSettings';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { createStyles } from '@theme/styles';

export function NotificationSettingsScreen() {
  return (
    <>
      <Appbar mode="large" leading="menu" headline="Notifications" />

      <ScrollableScreenSurface style={styles.surface}>
        <NotificationSettings />
      </ScrollableScreenSurface>
    </>
  );
}

const styles = createStyles({
  surface: {
    paddingTop: 8,
  },
});

export default withSuspense(NotificationSettingsScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
