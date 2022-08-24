import { useDeployAccount } from '~/mutations/account/useDeployAccount';
import { useIsDeployed } from '@network/useIsDeployed';
import { DeployIcon } from '~/util/theme/icons';
import { FAB } from '~/components/FAB';
import { CombinedAccount } from '~/queries/account';
import { useWallet } from '~/queries/wallets/useWallet';

export interface DeployAccountFABProps {
  account: CombinedAccount;
}

export const DeployAccountFAB = ({ account }: DeployAccountFABProps) => {
  const wallet = useWallet(account.walletIds[0]);
  const isDeployed = useIsDeployed(account.addr);
  const [deploy, deploying] = useDeployAccount(account);

  if (!wallet || isDeployed) return null;

  return (
    <FAB
      icon={DeployIcon}
      label="Apply"
      loading={deploying}
      onPress={() => deploy?.(wallet)}
    />
  );
};
