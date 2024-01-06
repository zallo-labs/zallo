import { useEffect, useRef } from 'react';
import { useGlobalSearchParams, usePathname } from 'expo-router';

import { useQuery } from '~/gql';
import { gql } from '~/gql/api';
import { ampli } from '~/lib/ampli';
import { useApproverAddress } from '~/lib/network/useApprover';
import { CONFIG } from '~/util/config';
import * as Sentry from '~/util/sentry/sentry';

ampli.load({
  client: {
    apiKey: CONFIG.aplitudeKey,
    configuration: {
      trackingSessionEvents: true,
    },
  },
});

const Query = gql(/* GraphQL */ `
  query Analytics {
    user {
      id
    }
  }
`);

export function Analytics() {
  const approver = useApproverAddress();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  const previousPathname = useRef<string>();

  const userId = useQuery(Query).data?.user.id;

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
