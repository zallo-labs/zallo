import { Link } from 'expo-router';
import { Button } from '~/components/Button';
import { AuthSettings } from '~/components/shared/AuthSettings';

export default function NotificationsOnboardingScreen() {
  return (
    <AuthSettings
      passwordHref="/onboard/password"
      actions={
        <Link href="/onboard/notifications" asChild>
          <Button mode="contained">Continue</Button>
        </Link>
      }
    />
  );
}
