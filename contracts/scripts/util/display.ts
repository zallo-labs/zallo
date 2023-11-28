import { formatUnits, formatEther } from 'viem';
import { Address } from 'lib';
import { CONFIG } from '../../config';
import { ContractTransactionResponse } from 'ethers';
import { network } from '../../test/util';

export async function displayTx(address: Address, tx: ContractTransactionResponse | null) {
  if (!tx) {
    console.log(`
  ====== Deployment ======
  Address: ${address}
  ========================
    `);
    return;
  }

  const receipt = await tx.wait();
  if (!receipt) return;

  const estCost = tx.gasLimit * (tx.gasPrice ?? (await network.getGasPrice()));
  const actualCost = receipt.gasUsed * receipt.gasPrice;

  console.log(`
  ====== Deployment ======
  Address: ${address}
  Block (number): ${receipt.blockNumber}
  Block (hash): ${receipt.blockHash}
  Gas limit: ${tx.gasLimit}
  Gas used : ${receipt.gasUsed}
  Cost (gwei) - est.  : ${formatUnits(estCost, 9)}
  Cost (eth)  - est.  : ${formatEther(estCost)}
  Cost (gwei) - actual: ${formatUnits(actualCost, 9)}
  Cost (eth)  - actual: ${formatEther(actualCost)}
  Cost (%)    - actual: ${formatUnits((100_00n * actualCost) / estCost, 2)}%
  ${
    CONFIG.chain.blockExplorers?.default &&
    `${CONFIG.chain.blockExplorers.default.url}/tx/${tx.hash}`
  }
  ========================
  `);
}
