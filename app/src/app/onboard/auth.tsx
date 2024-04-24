import { Link } from 'expo-router';
import { Button } from '#/Button';
import { ScrollView, View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { Appbar } from '#/Appbar/Appbar';
import { AuthSettings } from '#/auth/AuthSettings';
import { Actions } from '#/layout/Actions';
import { OnboardProgress } from '#/onboard/OnboardProgress';

export default function AuthOnboardingScreen() {
  const { styles } = useStyles(stylesheet);

  return (
    <ScrollView contentContainerStyle={styles.pane} stickyHeaderIndices={[0]}>
      <View>
        <OnboardProgress progress={0.4} />
        <Appbar mode="large" headline="Authentication" inset={false} />
      </View>

      <AuthSettings />

      <Actions>
        <Link href="/onboard/notifications" asChild>
          <Button mode="contained">Continue</Button>
        </Link>
      </Actions>
    </ScrollView>
  );
}

const stylesheet = createStyles(() => ({
  pane: {
    flexGrow: 1,
    gap: 8,
  },
}));

export { ErrorBoundary } from '#/ErrorBoundary';
