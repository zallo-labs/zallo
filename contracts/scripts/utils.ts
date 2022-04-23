import { ethers } from 'hardhat';

export const showTx = async (txHash: string) => {
  const { name: network } = await ethers.provider.getNetwork();
  console.log(
    `View the tx: https://${network}.etherscan.io/tx/${txHash}`,
  );
};
