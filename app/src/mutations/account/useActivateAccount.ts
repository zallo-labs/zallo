import { deployAccountProxy } from 'lib';
import { useAccountProxyFactory } from '../../util/network/useAccountProxyFactory';
import { useMemo, useState } from 'react';
import assert from 'assert';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useDevice } from '../../util/network/useDevice';
import { showInfo, showSuccess } from '~/provider/ToastProvider';
import { CombinedAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/user/useUser.api';

export const useActivateAccount = (account: CombinedAccount) => {
  const factory = useAccountProxyFactory();
  const device = useDevice();
  const faucet = useFaucet(device.address);
  const [deployUser] = useUser(account.deployUser);

  const [deploying, setDeploying] = useState(false);

  const deploy = useMemo(
    () =>
      !account.active
        ? async () => {
            setDeploying(true);
            showInfo({ text1: 'Deploying account...', autoHide: false });

            await faucet?.();

            const deploySalt = account.deploySalt;
            assert(deploySalt);

            const r = await deployAccountProxy(
              {
                impl: account.impl,
                user: {
                  addr: deployUser.addr,
                  configs: deployUser.configs.value,
                },
              },
              factory,
              deploySalt,
            );
            await r.account.deployed();

            showSuccess('Account deployed');
            setDeploying(false);
          }
        : undefined,
    [
      account.active,
      account.deploySalt,
      account.impl,
      deployUser.addr,
      deployUser.configs.value,
      factory,
      faucet,
    ],
  );

  return [deploy, deploying] as const;
};
