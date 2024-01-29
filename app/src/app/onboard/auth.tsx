import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { AuthSettings } from '~/components/shared/AuthSettings';

export default function NotificationsOnboardingScreen() {
  const router = useRouter();

  return (
    <AuthSettings
      passwordHref={`/onboard/password`}
      actions={
        <Button mode="contained" onPress={() => router.push(`/onboard/notifications`)}>
          Continue
        </Button>
      }
    />
  );
}
