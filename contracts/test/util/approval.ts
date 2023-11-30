import { mapAsync, Approval, Tx, Address, UAddress, asTypedData } from 'lib';
import { wallets } from './network';

export const getApprovals = async (
  account: UAddress,
  approvers: Set<Address>,
  tx: Tx,
): Promise<Approval[]> => {
  const typedData = asTypedData(account, tx);

  return mapAsync([...approvers], async (approver) => ({
    type: 'secp256k1',
    approver,
    signature: await wallets.find((w) => w.address === approver)!.signTypedData(typedData),
  }));
};
