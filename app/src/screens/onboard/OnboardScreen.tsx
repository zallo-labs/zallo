import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import LogoSvg from '~/../assets/logo-color.svg';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet } from 'react-native';
import { Screen } from '~/components/layout/Screen';
import { LinkGoogleButton } from '~/components/buttons/LinkGoogleButton';
import { LinkingCodeButton } from '~/components/buttons/LinkingCodeButton';
import { LinkLedgerButton } from '~/components/buttons/LinkLedgerButton';
import { gql } from '@api';
import { useUrqlApiClient } from '@api/client';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { LinkAppleButton } from '~/components/buttons/LinkAppleButton';

const Query = gql(/* GraphQL */ `
  query OnboardScreen {
    user {
      id
      name
    }
  }
`);

export type OnboardScreenProps = StackNavigatorScreenProps<'Onboard'>;

export const OnboardScreen = withSuspense(
  ({ navigation: { navigate } }: OnboardScreenProps) => {
    const api = useUrqlApiClient();

    const next = async () => {
      const user = (await api.query(Query, {}, { requestPolicy: 'network-only' })).data?.user;

      if (!user?.name) {
        navigate('CreateUser');
      } else {
        navigate('Approver', { isOnboarding: true });
      }
    };

    return (
      <Screen topInset>
        <View style={styles.header}>
          <LogoSvg style={styles.logo} />
          <Text variant="headlineSmall" style={styles.description}>
            Permission-based{'\n'}self-custodial smart wallet
          </Text>
        </View>

        <Actions>
          <Text variant="titleMedium" style={styles.continueText}>
            Continue with
          </Text>

          <View style={styles.methodsContainer}>
            <LinkAppleButton onLink={next} />

            <LinkGoogleButton onLink={next} />

            <LinkLedgerButton onLink={next} />

            <LinkingCodeButton onLink={next} />
          </View>

          <Button mode="contained" onPress={() => navigate('CreateUser')}>
            Continue
          </Button>
        </Actions>
      </Screen>
    );
  },
  () => null,
);

const styles = StyleSheet.create({
  header: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  logo: {
    marginBottom: 32,
  },
  description: {
    textAlign: 'center',
  },
  continueText: {
    textAlign: 'center',
  },
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
});
