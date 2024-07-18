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
    apiKey: CONFIG.aplitudeKey,
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
  }
`;

export function Analytics() {
  const approver = useApproverAddress();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  const previousPathname = useRef<string>();

  const userId = useLazyQuery<AnalyticsQuery>(Query, {}).user.id;

  useEffect(() => {
    ampli.identify(userId, { device_id: approver });
    Sentry.setUser({ id: approver });
  }, [approver, userId]);

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
