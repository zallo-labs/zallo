import { Image } from 'expo-image';
import { SearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { gql } from 'urql';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { LinkAppleButton } from '~/components/link/LinkAppleButton';
import { LinkGoogleButton } from '~/components/link/LinkGoogleButton';
import { LinkingTokenButton } from '~/components/link/LinkingTokenButton';
import { LinkLedgerButton } from '~/components/link/ledger/LinkLedgerButton';
import { useUrqlApiClient } from '@api/client';

const Query = gql(/* GraphQL */ `
  query OnboardScreen {
    user {
      id
      name
    }
  }
`);

export type OnboardScreenRoute = `/onboard/`;
export type OnboardScreenParams = SearchParams<OnboardScreenRoute>;

export default function OnboardScreen() {
  const { push } = useRouter();
  const api = useUrqlApiClient();

  const next = async () => {
    const user = (await api.query(Query, {}, { requestPolicy: 'network-only' })).data?.user;

    if (!user?.name) {
      push(`/onboard/user`);
    } else {
      push(`/onboard/approver`);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Image
          source={require('assets/logo-color.svg')}
          onError={(e) => {
            console.error(e);
          }}
          style={{ width: 325, height: 104 }}
        />
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
          <LinkingTokenButton onLink={next} />
        </View>

        <Button mode="contained" onPress={() => push(`/onboard/user`)}>
          Continue
        </Button>
      </Actions>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  description: {
    marginTop: 32,
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
