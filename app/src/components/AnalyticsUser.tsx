import { useApprover } from '@network/useApprover';
import { useEffect } from 'react';
import { Native } from 'sentry-expo';
import analytics from '@react-native-firebase/analytics';

export const AnalyticsUser = () => {
  const approver = useApprover();

  useEffect(() => {
    analytics().setUserId(approver.address);
    Native.setUser({ id: approver.address });
  }, [approver.address]);

  return null;
};
