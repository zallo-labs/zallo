import { useApproverAddress } from '@network/useApprover';
import { useEffect } from 'react';
import { Native } from 'sentry-expo';
import analytics from '@react-native-firebase/analytics';

export const AnalyticsUser = () => {
  const approver = useApproverAddress();

  useEffect(() => {
    analytics().setUserId(approver);
    Native.setUser({ id: approver });
  }, [approver]);

  return null;
};
