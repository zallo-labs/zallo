import hre from 'hardhat';
import { Address } from 'lib';

// https://v2-docs.zksync.io/dev/developer-guides/contracts/contract-verification.html#verify-smart-contract-programmatically
export const verify = (contract: string, address: Address) =>
  hre.run('verify:verify', { contract, address });
