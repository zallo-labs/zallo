import { useApproverAddress } from '@network/useApprover';
import { useEffect } from 'react';
import * as Sentry from '~/util/sentry/sentry';
// import analytics from '@react-native-firebase/analytics';

export const AnalyticsUser = () => {
  const approver = useApproverAddress();

  useEffect(() => {
    // analytics().setUserId(approver);
    Sentry.setUser({ id: approver });
  }, [approver]);

  return null;
};
