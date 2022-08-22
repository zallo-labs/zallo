import { useDeployAccount } from '@features/account/useDeployAccount';
import { useIsDeployed } from '@features/account/useIsDeployed';
import { DeployIcon } from '@util/theme/icons';
import { FAB } from '~/components2/FAB';
import { CombinedAccount } from '~/queries/account';
import { useWallet } from '~/queries/wallets/useWallet';

export interface DeployAccountFABProps {
  account: CombinedAccount;
}

export const DeployAccountFAB = ({ account }: DeployAccountFABProps) => {
  const wallet = useWallet(account.walletIds[0]);
  const isDeployed = useIsDeployed(account.addr);
  const deploy = useDeployAccount(account);

  if (!wallet || isDeployed) return null;

  return (
    <FAB
      icon={DeployIcon}
      label="Apply"
      onPress={() => deploy?.(wallet)}
    />
  );
};
