import { Link } from 'expo-router';
import { Button } from '#/Button';
import { AuthSettings } from '#/shared/AuthSettings';

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
