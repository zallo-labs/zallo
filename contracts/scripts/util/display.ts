import { ethers } from 'hardhat';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Address } from 'lib';
import { CONFIG } from '../../config';

export const displayTx = async (addr: Address, tx: TransactionResponse) => {
  const receipt = await tx.wait();

  const estCost = tx.gasLimit.mul(tx.gasPrice ?? 0);
  const actualCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

  console.log(`
  ====== Deployment ======
  Address: ${addr}
  Block (number): ${receipt.blockNumber}
  Block (hash): ${receipt.blockHash}
  Gas limit: ${tx.gasLimit}
  Gas used : ${receipt.gasUsed}
  Cost (gwei) - est.  : ${ethers.utils.formatUnits(estCost, 9)}
  Cost (eth)  - est.  : ${ethers.utils.formatEther(estCost)}
  Cost (gwei) - actual: ${ethers.utils.formatUnits(actualCost, 9)}
  Cost (eth)  - actual: ${ethers.utils.formatEther(actualCost)}
  ${CONFIG.chain.blockExplorers?.default && `${CONFIG.chain.blockExplorers.default}/tx/${tx.hash}`}
  ========================
  `);
};
