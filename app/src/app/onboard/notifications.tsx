import { useRouter } from 'expo-router';
import { NotificationSettings } from '#/NotificationSettings';
import { createStyles } from '@theme/styles';
import { View } from 'react-native';
import { OnboardProgress } from '#/onboard/OnboardProgress';
import { Appbar } from '#/Appbar/Appbar';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { OnboardMainPane } from '#/onboard/OnboardMainPane';

export function NotificationsOnboardingScreen() {
  const router = useRouter();

  return (
    <OnboardMainPane contentContainerStyle={styles.pane} stickyHeaderIndices={[0]}>
      <View>
        <OnboardProgress progress={0.6} />
        <Appbar mode="large" headline="Notifications" inset={false} />
      </View>

      <NotificationSettings next={() => router.push('/onboard/account')} />
    </OnboardMainPane>
  );
}

const styles = createStyles({
  pane: {
    gap: 8,
  },
});

export default withSuspense(NotificationsOnboardingScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
