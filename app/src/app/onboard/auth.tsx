import { Link } from 'expo-router';
import { Button } from '#/Button';
import { View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { Appbar } from '#/Appbar/Appbar';
import { AuthSettings } from '#/auth/AuthSettings';
import { Actions } from '#/layout/Actions';
import { OnboardProgress } from '#/onboard/OnboardProgress';
import { OnboardMainPane } from '#/onboard/OnboardMainPane';

export default function AuthOnboardingScreen() {
  const { styles } = useStyles(stylesheet);

  return (
    <OnboardMainPane contentContainerStyle={styles.pane} stickyHeaderIndices={[0]}>
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
    </OnboardMainPane>
  );
}

const stylesheet = createStyles(() => ({
  pane: {
    gap: 8,
  },
}));

export { ErrorBoundary } from '#/ErrorBoundary';
