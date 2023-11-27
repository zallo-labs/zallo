import { task } from 'hardhat/config';

interface Args {
  account: string;
}

task('balance', "Prints an account's balance")
  .addParam('account', "The account's address")
  .setAction(async (args: Args, { ethers }) => {
    const account = ethers.getAddress(args.account);
    const provider = ethers.provider;
    const balance = await provider.getBalance(account);

    console.log(ethers.formatEther(balance), 'ETH');
  });
