import hre from 'hardhat';
import { Address } from 'lib';

export interface VerifyOptions {
  address: Address;
  contract: string;
  constructorArguments?: unknown[];
}

// https://era.zksync.io/docs/dev/building-on-zksync/contracts/contract-verification.html#verify-smart-contract-programmatically
export const verify = (options: VerifyOptions) => hre.run('verify:verify', options);
