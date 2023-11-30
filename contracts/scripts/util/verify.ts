import hre from 'hardhat';
import { Address, Hex } from 'lib';
import { CONFIG } from '../../config';

export interface VerifyOptions {
  address: Address;
  contract: string;
  constructorArguments?: Hex | any[];
}

// https://era.zksync.io/docs/dev/building-on-zksync/contracts/contract-verification.html#verify-smart-contract-programmatically
export const verify = async (args: VerifyOptions) => {
  if (CONFIG.chain.verifyUrl) await hre.run('verify:verify', args);
};
