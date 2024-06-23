import { useEffect, useLayoutEffect } from 'react';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ErrorBoundary as BaseErrorBoundary,
  ErrorBoundaryProps,
} from '#/ErrorBoundary/ErrorBoundary';
import { z } from 'zod';
import NotFound from '~/app/+not-found';
import { gql } from '@api';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useSelectedAccount, useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { zUAddress } from '~/lib/zod';
import { AppbarHeader } from '#/Appbar/AppbarHeader';
import { withSuspense } from '#/skeleton/withSuspense';
import { Splash } from '#/Splash';

const Query = gql(/* GraphQL */ `
  query AccountLayout($account: UAddress!) {
    account(input: { account: $account }) {
      id
    }
  }
`);

const Params = z.object({ account: zUAddress().optional() }); // Required as the this route is always first in the history, so may be rendered at any time
export const AccountParams = z.object({ account: zUAddress() });

function AccountLayout() {
  const lastSelected = useSelectedAccount();
  const accountParam = useLocalParams(Params).account;
  const account = accountParam ?? lastSelected!;
  const setSelectedAccount = useSetSelectedAccont();
  const params = useLocalSearchParams();
  const router = useRouter();

  const query = useQuery(Query, { account });
  const found = query.data?.account || query.fetching || query.stale;

  useLayoutEffect(() => {
    if (!accountParam && lastSelected) router.setParams({ ...params, account: lastSelected });
  }, [accountParam, lastSelected, params, router]);

  useEffect(() => {
    setSelectedAccount(found ? account : null);
  }, [account, found, setSelectedAccount]);

  // Redirect to the home page if account isn't found
  if (!found) return <Redirect href="/" />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack screenOptions={{ header: (props) => <AppbarHeader {...props} /> }} />
    </>
  );
}

export default withSuspense(AccountLayout, <Splash />);

export function ErrorBoundary(props: ErrorBoundaryProps) {
  if (props.error instanceof z.ZodError) return <NotFound />;

  return <BaseErrorBoundary {...props} />;
}
