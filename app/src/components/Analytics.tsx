import { useApproverAddress } from '~/lib/network/useApprover';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react-native';
import { ampli } from '~/lib/ampli';
import { CONFIG } from '~/util/config';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { AnalyticsQuery } from '~/api/__generated__/AnalyticsQuery.graphql';

ampli.load({
  client: {
    apiKey: CONFIG.amplitudeKey,
    configuration: {
      trackingSessionEvents: true,
    },
  },
});

const Query = graphql`
  query AnalyticsQuery {
    user {
      id
    }
    accounts {
      address
    }
  }
`;

export function Analytics() {
  const approver = useApproverAddress();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  const previousPathname = useRef<string>();

  const { user, accounts } = useLazyQuery<AnalyticsQuery>(Query, {});

  useEffect(() => {
    Sentry.setUser({ id: approver });
    ampli.identify(user.id, { device_id: approver });
    ampli.client.setGroup(
      'account',
      accounts.map((a) => a.address),
    );
  }, [approver, user.id, accounts]);

  useEffect(() => {
    ampli.screenView({
      pathname,
      params,
      ...(previousPathname.current !== pathname && {
        previousPathname: previousPathname.current,
      }),
    });

    Sentry.addBreadcrumb({
      level: 'info',
      type: 'navigation',
      data: {
        ...(previousPathname.current !== pathname && {
          previousPathname: previousPathname.current,
        }),
        pathname,
        params,
      },
    });

    previousPathname.current = pathname;
  }, [pathname, params]);

  return null;
}
