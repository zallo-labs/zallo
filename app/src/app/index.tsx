import { ScrollView, View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { LandingHeader } from '#/landing/LandingHeader';
import { PrimarySection } from '#/landing/PrimarySection';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { Redirect } from 'expo-router';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zBool } from '~/lib/zod';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { app_LandingScreenQuery } from '~/api/__generated__/app_LandingScreenQuery.graphql';

// Must use Query.accounts to avoid potential redirect loop with AccountLayout
const Query = graphql`
  query app_LandingScreenQuery {
    accounts {
      id
      address
    }
  }
`;

const LandingScreenParams = z.object({ redirect: zBool().default('true') });

function LandingScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const { redirect } = useLocalParams(LandingScreenParams);
  const selectedAccount = useSelectedAccount();

  const query = useLazyLoadQuery<app_LandingScreenQuery>(Query, {});

  const account = selectedAccount ?? query.accounts[0]?.address;
  if (redirect && account)
    return <Redirect href={{ pathname: `/(nav)/[account]/(home)/`, params: { account } }} />;

  return (
    <ScrollView contentContainerStyle={styles.root} stickyHeaderIndices={[0]}>
      <LandingHeader />

      <LinearGradient
        colors={[theme.colors.primaryContainer, theme.colors.surface]}
        style={styles.gradient}
        locations={[0.6, 1]}
      >
        <View style={styles.container}>
          <PrimarySection account={account} />
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const stylesheet = createStyles((_theme, { insets, screen }) => ({
  root: {
    flexGrow: 1,
    paddingBottom: insets.bottom,
  },
  gradient: {
    flex: 1,
    maxHeight: screen.height,
  },
  container: {
    flex: 1,
    alignSelf: 'center',
    paddingHorizontal: 16,
    maxWidth: 1280,
    width: '100%',
  },
}));

export default withSuspense(LandingScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
