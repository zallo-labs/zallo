import { useRouter } from 'expo-router';

import NotificationSettings from '~/components/shared/NotificationSettings';

export default function NotificationsOnboardingScreen() {
  const router = useRouter();
  return <NotificationSettings next={() => router.push(`/`)} />;
}
