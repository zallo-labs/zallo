import { useApprover } from '@network/useApprover';
import { useEffect } from 'react';
import { Native } from 'sentry-expo';
import analytics from '@react-native-firebase/analytics';
import { useSelectedAccount } from './AccountSelector/useSelectedAccount';
import { setContext } from '~/util/analytics';

export const AnalyticsUser = () => {
  const approver = useApprover();
  const selectedAccount = useSelectedAccount();

  useEffect(() => {
    analytics().setUserId(approver.address);
    Native.setUser({ id: approver.address });
  }, [approver.address]);

  useEffect(() => {
    if (selectedAccount) setContext('account', selectedAccount);
  }, [selectedAccount]);

  return null;
};
