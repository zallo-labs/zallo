import { useApproverAddress } from '~/lib/network/useApprover';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as Sentry from '~/util/sentry/sentry';
// import analytics from '@react-native-firebase/analytics';

export function Analytics() {
  const approver = useApproverAddress();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  const previousPathname = useRef<string>();

  useEffect(() => {
    // analytics().setUserId(approver);
    Sentry.setUser({ id: approver });
  }, [approver]);

  useEffect(() => {
    // analytics().logScreenView({
    //   screen_name: pathname,
    //   screen_class: pathname,
    // });

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
