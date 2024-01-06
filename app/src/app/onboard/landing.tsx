import { ScrollView, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Text } from 'react-native-paper';

import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { LinkLedgerButton } from '~/components/link/ledger/LinkLedgerButton';
import { LinkAppleButton } from '~/components/link/LinkAppleButton';
import { LinkGoogleButton } from '~/components/link/LinkGoogleButton';
import { LinkingButton } from '~/components/link/LinkingButton';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api';
import { CONFIG } from '~/util/config';
import {
  AppScreenshots,
  AppStoreBadge,
  GithubIcon,
  GooglePlayBadge,
  TwitterIcon,
  ZalloLogo,
} from '~/util/theme/icons';
import { createStyles, useStyles } from '~/util/theme/styles';

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
  const next = () => push(`/onboard/(drawer)/account`);

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
        <View style={[styles.spacer, styles.onlyExpanded]} />

        <View style={styles.mainContent}>
          <ZalloLogo style={styles.logo} contentFit="contain" />

          <Text variant="headlineSmall" style={styles.text}>
            Self-custody without compromise
          </Text>

          <View style={styles.companionContainer}>
            <Text variant="titleMedium" style={styles.text}>
              Use your account across all devices
            </Text>

            <View style={styles.appStores}>
              <Link href={CONFIG.metadata.appStore}>
                <AppStoreBadge style={styles.appStoreBadge} />
              </Link>
              <Link href={CONFIG.metadata.playStore}>
                <GooglePlayBadge style={styles.playStoreBadge} />
              </Link>
            </View>
          </View>
        </View>

        <View style={[styles.screenshotsContainer, styles.onlyExpanded]}>
          <AppScreenshots style={styles.screenshots} contentFit="contain" />
        </View>
      </View>

      <Actions flex={false} style={styles.actionsContainer}>
        <Text variant="titleMedium" style={styles.text}>
          Continue with
        </Text>

        <View style={styles.methodsContainer}>
          <LinkAppleButton user={user} onLink={next} />
          <LinkGoogleButton user={user} onLink={next} />
          <LinkLedgerButton onLink={next} />
          <LinkingButton onLink={next} />
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 32,
    gap: 8,
    flexWrap: 'wrap',
  },
  spacer: {
    flex: 1,
  },
  mainContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    minWidth: 325,
    minHeight: 104,
  },
  companionContainer: {
    gap: 16,
    marginVertical: 16,
  },
  appStores: {
    flexDirection: 'row',
    gap: 16,
  },
  text: {
    textAlign: 'center',
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
