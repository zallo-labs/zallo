import { z } from 'zod';
import { TopTabs } from '#/layout/TopTabs';
import { HomeHeader } from '#/home/HomeHeader';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useSelectedAccount, useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { zUAddress } from '~/lib/zod';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { gql } from '@api';
import { useQuery } from '~/gql';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import {
  ErrorBoundary as BaseErrorBoundary,
  ErrorBoundaryProps,
} from '#/ErrorBoundary/ErrorBoundary';
import NotFound from '~/app/+not-found';

const Query = gql(/* GraphQL */ `
  query HomeLayout($account: UAddress!) {
    account(input: { account: $account }) {
      id
    }
  }
`);

const context = { suspense: false };

const InternalParams = z.object({ account: zUAddress().optional() }); // Required as the this route is always first in the history, so may be rendered at any time
export const AccountParams = z.object({ account: zUAddress() });

export default function HomeLayout() {
  const lastSelected = useSelectedAccount();
  const account = useLocalParams(InternalParams).account ?? lastSelected!;
  const setSelectedAccount = useSetSelectedAccont();

  useEffect(() => {
    if (account) setSelectedAccount(account);
  }, [account, setSelectedAccount]);

  const query = useQuery(Query, { account }, { context });

  const accountFound = query.data?.account || query.fetching || query.stale;
  useEffect(() => {
    if (!accountFound) setSelectedAccount(null);
  }, [accountFound, setSelectedAccount]);

  // Redirect to the home page if account isn't found
  if (!accountFound) return <Redirect href="/" />;

  return (
    <ScrollableScreenSurface>
      <HomeHeader account={account} />

      <TopTabs>
        <TopTabs.Screen name="index" options={{ title: 'Tokens' }} initialParams={{ account }} />
        <TopTabs.Screen
          name="activity"
          options={{ title: 'Activity' }}
          initialParams={{ account }}
        />
      </TopTabs>
    </ScrollableScreenSurface>
  );
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  if (props.error instanceof z.ZodError) return <NotFound />;

  return <BaseErrorBoundary {...props} />;
}
