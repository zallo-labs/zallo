import { useDevice } from '@features/device/useDevice';
import { parseEther } from 'ethers/lib/utils';
import { useEffect } from 'react';
import { useFaucet } from '~/mutations/useFacuet.api';
import { CHAIN } from '~/provider';

export const AutoFaucet = () => {
  const device = useDevice();
  const faucet = useFaucet();

  useEffect(() => {
    (async () => {
      if (CHAIN.isTestnet) {
        const walletBalance = await device.getBalance();
        if (walletBalance.lt(parseEther('0.001'))) faucet(device.address);
      }
    })();
  }, [device, faucet]);

  return null;
};
