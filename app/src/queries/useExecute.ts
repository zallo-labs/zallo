import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { Op, Signer, signTx } from 'lib';

const GAS_LIMIT = 100000;

export const useExecute = () => {
  const { safe, groups } = useSafe();
  const wallet = useWallet();

  const execute = async (...ops: Op[]) => {
    const groupHash = groups[0].hash;
    const signer: Signer = {
      addr: wallet.address,
      signature: await signTx(wallet, safe.address, ...ops),
    };

    console.log('Executing', {
      ops,
      groupHash,
    });

    if (ops.length === 1) {
      await safe.execute(ops[0], groupHash, [signer], {
        gasLimit: GAS_LIMIT,
      });
    } else if (ops.length > 1) {
      await safe.multiExecute(ops, groupHash, [signer], {
        gasLimit: GAS_LIMIT,
      });
    }
  };

  return execute;
};
