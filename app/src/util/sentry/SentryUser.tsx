import { useApprover } from '@network/useApprover';
import { useEffect } from 'react';
import { Native } from 'sentry-expo';

export const SentryUser = () => {
  const approver = useApprover();

  useEffect(() => Native.setUser({ id: approver.address }), [approver.address]);

  return null;
};
