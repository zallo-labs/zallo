import hre from 'hardhat';
import { Address, Hex } from 'lib';

export interface VerifyOptions {
  address: Address;
  contract: string;
  constructorArguments?: Hex | unknown[];
}

// https://era.zksync.io/docs/dev/building-on-zksync/contracts/contract-verification.html#verify-smart-contract-programmatically
export const verify = (options: VerifyOptions) => hre.run('verify:verify', options);
