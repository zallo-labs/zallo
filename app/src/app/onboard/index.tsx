import { SearchParams, useRouter } from 'expo-router';
import { Platform, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { gql } from 'urql';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { LinkAppleButton } from '~/components/link/LinkAppleButton';
import { LinkGoogleButton } from '~/components/link/LinkGoogleButton';
import { LinkingButton } from '~/components/link/LinkingButton';
import { LinkLedgerButton } from '~/components/link/ledger/LinkLedgerButton';
import { useUrqlApiClient } from '@api/client';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import {
  AppScreenshots,
  AppStoreBadge,
  GithubIcon,
  GooglePlayBadge,
  LogoIcon,
  TwitterIcon,
} from '@theme/icons';
import { CONFIG } from '~/util/config';
import { makeStyles } from '@theme/makeStyles';

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
  const styles = useStyles();
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
    <ScrollView contentContainerStyle={styles.root}>
      <AppbarOptions
        leading={() => null}
        trailing={[
          (props) => <TwitterIcon {...props} onPress={() => push(CONFIG.metadata.twitter)} />,
          (props) => <GithubIcon {...props} onPress={() => push(CONFIG.metadata.github)} />,
        ]}
      />

      <View style={styles.content}>
        <View style={styles.spacer} />

        <View style={styles.mainContent}>
          <LogoIcon style={styles.logo} contentFit="contain" />

          <Text variant="headlineSmall" style={styles.text}>
            Self-custody without compromise
          </Text>

          <View style={styles.companionContainer}>
            <Text variant="titleMedium" style={styles.text}>
              Get the companion app
            </Text>

            <View style={styles.appStores}>
              <AppStoreBadge style={styles.appStoreBadge} />
              <GooglePlayBadge style={styles.playStoreBadge} />
            </View>
          </View>
        </View>

        <View style={styles.screenshotsContainer}>
          <AppScreenshots style={styles.screenshots} contentFit="contain" />
        </View>
      </View>

      <Actions flex={false} style={styles.actionsContainer}>
        <Text variant="titleMedium" style={styles.text}>
          Continue with
        </Text>

        <View style={styles.methodsContainer}>
          <LinkAppleButton onLink={next} />
          <LinkGoogleButton onLink={next} />
          <LinkLedgerButton onLink={next} />
          <LinkingButton onLink={next} />
        </View>

        <Button mode="contained" onPress={() => push(`/onboard/user`)}>
          Continue
        </Button>
      </Actions>
    </ScrollView>
  );
}

const useStyles = makeStyles(({ layout, window }) => ({
  root: {
    flexGrow: 1,
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
    ...(!(Platform.OS === 'web' && layout === 'expanded') && { display: 'none' }),
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
    ...(Platform.OS !== 'web' && { display: 'none' }),
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
    ...(!(Platform.OS === 'web' && layout === 'expanded') && { display: 'none' }),
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
}));
