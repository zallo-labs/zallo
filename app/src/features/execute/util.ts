import { Address, SignedTx, Tx } from 'lib';

export const createSt = (tx: Partial<Tx> & { to: Address }): SignedTx => ({
  tx: {
    data: [],
    nonce: 0, // TODO: generate random nonce
    value: 0,
    ...tx,
  },
  signers: [],
});
