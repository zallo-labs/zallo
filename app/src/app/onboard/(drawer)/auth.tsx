import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { AuthSettings } from '~/components/shared/AuthSettings';

export default function NotificationsOnboardingScreen() {
  const router = useRouter();

  return (
    <AuthSettings
      passwordHref={`/onboard/(drawer)/auth`}
      actions={
        <Button mode="contained" onPress={() => router.push(`/onboard/(drawer)/notifications`)}>
          Continue
        </Button>
      }
    />
  );
}
