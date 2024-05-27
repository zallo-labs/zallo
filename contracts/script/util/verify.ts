import hre from 'hardhat';
import { Address, Hex } from 'lib';
import { CONFIG } from '../../config';
import chalk from 'chalk';

export interface VerifyOptions {
  address: Address;
  contract: string;
  constructorArguments?: Hex | Readonly<unknown[]>;
}

// https://era.zksync.io/docs/dev/building-on-zksync/contracts/contract-verification.html#verify-smart-contract-programmatically
export const verify = async (args: VerifyOptions) => {
  try {
    if (CONFIG.chain.verifyUrl) await hre.run('verify:verify', args);
  } catch (e) {
    if (e instanceof Error && e.message.includes('already verified')) {
      console.log(chalk.green('Already verified'));
    } else {
      throw e;
    }
  }
};
