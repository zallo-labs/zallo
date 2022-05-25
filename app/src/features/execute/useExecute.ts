import { useSafe } from '@features/safe/SafeProvider';
import { SignedTx } from 'lib';

export const useExecute = () => {
  const { safe, groups } = useSafe();

  const execute = async (...signedTxs: SignedTx[]) => {
    const groupHash = groups[0].hash;
    
    console.log('Executing', {
      signedTxs,
      groupHash,
    });

    if (signedTxs.length === 1) {
      await safe.execute(signedTxs[0], groupHash);
    } else if (signedTxs.length > 1) {
      await safe.batchExecute(signedTxs, groupHash);
    }
  };

  return execute;
};
