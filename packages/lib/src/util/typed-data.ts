import { TypedDataDomain } from 'abitype';
import { UAddress, asAddress, asChain } from '../address';
import { CHAINS } from 'chains';

export function getContractTypedDataDomain(contract: UAddress) {
  return {
    chainId: CHAINS[asChain(contract)].id,
    verifyingContract: asAddress(contract),
  } satisfies TypedDataDomain;
}
