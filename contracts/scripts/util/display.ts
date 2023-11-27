import { ethers } from 'hardhat';
import { Address } from 'lib';
import { CONFIG } from '../../config';
import { ContractTransactionResponse } from 'ethers';

export const displayTx = async (addr: Address, tx: ContractTransactionResponse) => {
  const receipt = await tx.wait();
  if (!receipt) return;

  const estCost = tx.gasLimit * tx.gasPrice;
  const actualCost = receipt.gasUsed * receipt.gasPrice;

  console.log(`
  ====== Deployment ======
  Address: ${addr}
  Block (number): ${receipt.blockNumber}
  Block (hash): ${receipt.blockHash}
  Gas limit: ${tx.gasLimit}
  Gas used : ${receipt.gasUsed}
  Cost (gwei) - est.  : ${ethers.formatUnits(estCost, 9)}
  Cost (eth)  - est.  : ${ethers.formatEther(estCost)}
  Cost (gwei) - actual: ${ethers.formatUnits(actualCost, 9)}
  Cost (eth)  - actual: ${ethers.formatEther(actualCost)}
  ${
    CONFIG.chain.blockExplorers?.default &&
    `${CONFIG.chain.blockExplorers.default.url}/tx/${tx.hash}`
  }
  ========================
  `);
};
