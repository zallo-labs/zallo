import { Link, useRouter } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '#/Button';
import { Actions } from '#/layout/Actions';
import { LinkAppleButton } from '#/link/LinkAppleButton';
import { LinkGoogleButton } from '#/link/LinkGoogleButton';
import { LinkZalloButton } from '#/link/LinkZalloButton';
import { LinkLedgerButton } from '#/link/ledger/LinkLedgerButton';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { AppStoreBadge, GithubIcon, GooglePlayBadge, ZalloLogo, TwitterIcon } from '@theme/icons';
import { CONFIG } from '~/util/config';
import { createStyles, useStyles } from '@theme/styles';
import { gql } from '@api';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query Landing {
    user {
      id
      ...LinkAppleButton_User
      ...LinkGoogleButton_User
    }
  }
`);

export default function LandingScreen() {
  const { styles } = useStyles(stylesheet);
  const { push } = useRouter();
  const next = () => push(`/onboard/account`);

  const { user } = useQuery(Query).data;

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <AppbarOptions
        leading={() => null}
        trailing={[
          (props) => <TwitterIcon {...props} onPress={() => push(CONFIG.metadata.twitter)} />,
          (props) => <GithubIcon {...props} onPress={() => push(CONFIG.metadata.github)} />,
        ]}
      />

      <View style={styles.content}>
        <ZalloLogo style={styles.logo} contentFit="contain" />

        <Text variant="headlineSmall" style={styles.text}>
          Self-custodial onchain banking
        </Text>

        <View style={styles.companionContainer}>
          <Text variant="titleMedium" style={styles.text}>
            Get the companion app
          </Text>

          <View style={styles.stores}>
            <Link href={CONFIG.metadata.appStore}>
              <AppStoreBadge style={styles.appStoreBadge} />
            </Link>
            <Link href={CONFIG.metadata.playStore}>
              <GooglePlayBadge style={styles.playStoreBadge} />
            </Link>
          </View>
        </View>
      </View>

      <Actions flex={false} style={styles.actionsContainer}>
        <LinkZalloButton onLink={next} />
        <LinkLedgerButton onLink={next} />
        <LinkGoogleButton user={user} onLink={next} />
        <LinkAppleButton user={user} onLink={next} />

        <Button mode="contained" onPress={next} labelStyle={styles.actionButtonLabel}>
          Continue
        </Button>
      </Actions>
    </ScrollView>
  );
}

const stylesheet = createStyles({
  root: {
    flexGrow: 1,
  },
  onlyExpanded: {
    display: {
      compact: 'none',
      medium: 'none',
      expanded: 'flex',
    },
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 32,
    gap: 16,
  },
  spacer: {
    flex: 1,
  },
  logo: {
    minWidth: 312,
    minHeight: 120,
  },
  companionContainer: {
    gap: 8,
    marginVertical: 16,
  },
  text: {
    textAlign: 'center',
  },
  stores: {
    flexDirection: 'row',
    gap: 16,
  },
  appStoreBadge: {
    width: 143,
    height: 48,
  },
  playStoreBadge: {
    width: 161,
    height: 48,
  },
  screenshotsContainer: {
    flex: 1,
    alignItems: 'center',
    minWidth: 'auto',
  },
  screenshots: {
    width: 413,
    height: 453,
  },
  actionsContainer: {
    alignSelf: 'center',
    maxWidth: 1000,
    width: '100%',
  },
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  actionButtonLabel: {
    alignSelf: 'stretch',
  },
});

export { ErrorBoundary } from '#/ErrorBoundary';
