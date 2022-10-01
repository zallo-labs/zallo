import { useDevice } from '@network/useDevice';
import { Address, UserId } from 'lib';
import { useMemo } from 'react';
import { useUser } from './useUser.api';

export const useDeviceUser = (account: Address) => {
  const device = useDevice();
  const userId: UserId = useMemo(
    () => ({ account, addr: device.address }),
    [account, device.address],
  );

  return useUser(userId);
};
