import { View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { LandingHeader } from '#/landing/LandingHeader';
import { PrimarySection } from '#/landing/PrimarySection';
import { LinearGradient } from 'expo-linear-gradient';
import { gql } from '@api';
import { useQuery } from '~/gql';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { Redirect } from 'expo-router';
import { OperationContext } from 'urql';

const Query = gql(/* GraphQL */ `
  query HelloScreen {
    accounts {
      id
      address
    }
  }
`);

const context = { suspense: false } satisfies Partial<OperationContext>;

export default function LandingScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const selectedAccount = useSelectedAccount();

  const query = useQuery(Query, undefined, { context });
  const accounts = query.data.accounts;

  if (selectedAccount || (accounts.length && !query.stale)) {
    const account =
      accounts.find((a) => a.address === selectedAccount)?.address ?? accounts[0].address;

    return <Redirect href={{ pathname: `/(drawer)/[account]/(home)/`, params: { account } }} />;
  }

  return (
    <View style={styles.root}>
      <LandingHeader />

      <LinearGradient
        colors={[theme.colors.primaryContainer, theme.colors.surface]}
        style={styles.gradient}
        locations={[0.6]}
      >
        <View style={styles.container}>
          <PrimarySection />
        </View>
      </LinearGradient>
    </View>
  );
}

const stylesheet = createStyles((_theme, { screen }) => ({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    maxHeight: screen.height,
  },
  container: {
    flex: 1,
    alignSelf: 'center',
    paddingHorizontal: 16,
    maxWidth: 864,
  },
}));

export { ErrorBoundary } from '#/ErrorBoundary';
