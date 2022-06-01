import * as zk from 'zksync-web3';
import { createTx, Safe, SignedTx, signTx, Tx } from 'lib';
import { SignerStruct } from 'lib/src/contracts/Safe';

export const createSignedTx = async (
  safe: Safe,
  wallets: zk.Wallet[],
  txOpts: Partial<Tx>,
): Promise<SignedTx> => {
  const tx = createTx(txOpts);

  const signers = (
    await Promise.all(
      wallets.map(
        async (wallet): Promise<SignerStruct> => ({
          addr: wallet.address,
          signature: await signTx(wallet, safe, tx),
        }),
      ),
    )
  ).sort((a, b) => a.addr.localeCompare(b.addr));

  return { tx, signers };
};
