import '@nomiclabs/hardhat-waffle';
import { task } from 'hardhat/config';

task('accounts', 'Prints the list of accounts').setAction(
  async (args: unknown, { ethers }) => {
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
      console.log(account.address);
    }
  },
);
