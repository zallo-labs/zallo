import { task } from 'hardhat/config';

interface Args {
  account: string;
  amount: string;
}

task('deposit', 'Deposit funds to an address')
  .addParam('account', "The account's address")
  .addParam('amount', 'Deposit amount (in ETH)')
  .setAction(async (taskArgs: Args, { ethers }) => {
    const signers = await ethers.getSigners();
    const signer = signers[signers.length - 1]!;
    const value = ethers.parseEther(taskArgs.amount);

    const tx = await signer.sendTransaction({
      to: taskArgs.account,
      value,
    });

    console.log(
      `${ethers.formatEther(value)} deposited to ${taskArgs.account} in transaction ${tx.hash}`,
    );
  });
