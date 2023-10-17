import NotificationSettings from '~/components/NotificationSettings';
import { useCreateFirsAccount } from '~/hooks/useCreateFirstAccount';

export default function NotificationsOnboardingScreen() {
  const createFirstAccount = useCreateFirsAccount();

  return <NotificationSettings next={createFirstAccount} />;
}
