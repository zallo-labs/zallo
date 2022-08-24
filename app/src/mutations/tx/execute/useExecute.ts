import { useDeployAccount } from '~/mutations/account/useDeployAccount';
import { executeTx, Signerish } from 'lib';
import { useCallback } from 'react';
import { CombinedWallet, toActiveWallet } from '~/queries/wallets';
import { ProposedTx } from '~/queries/tx';
import { useApiSubmitExecution } from './useSubmitExecution.api';
import { CombinedAccount } from '~/queries/account';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useDevice } from '~/util/network/useDevice';
import { useFeeToken } from '~/components/token/useFeeToken';

export const useExecute = (
  account: CombinedAccount,
  wallet: CombinedWallet,
  tx: ProposedTx,
) => {
  const submitExecution = useApiSubmitExecution();
  const [deploy] = useDeployAccount(account);
  const feeToken = useFeeToken();
  const device = useDevice();
  const faucet = useFaucet(device.address);

  const execute = useCallback(async () => {
    // The device currently needs funds as the tx is executes the transaction
    // This can be removed once AA can call other contracts during execution - https://v2-docs.zksync.io/dev/zksync-v2/aa.html#limitations-of-the-verification-step
    await faucet?.();

    // Deploy if not already deployed
    await deploy?.(wallet);

    const signers: Signerish[] = tx.approvals.map((approval) => ({
      approver: approval.addr,
      signature: approval.signature,
    }));

    const resp = await executeTx(
      account.contract,
      tx,
      toActiveWallet(wallet),
      signers,
      {
        customData: {
          feeToken: feeToken.addr,
        },
      },
    );

    await submitExecution(tx, resp);
  }, [
    faucet,
    deploy,
    wallet,
    tx,
    account.contract,
    feeToken.addr,
    submitExecution,
  ]);

  return execute;
};
