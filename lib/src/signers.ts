import { BytesLike } from 'ethers';
import { Address, compareAddresses } from './addr';
import { SignerStruct } from './contracts/Safe';

export interface Signer {
  addr: Address;
  signature: BytesLike;
}

export const toSafeSigners = (signers: Signer[]): SignerStruct[] =>
  signers
    .sort((a, b) => compareAddresses(a.addr, b.addr))
    .map(
      (s): SignerStruct => ({
        // Copy explicitly to avoid additional keys being included
        addr: s.addr,
        signature: s.signature,
      }),
    );
