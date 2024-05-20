import { createPublicClient, createWalletClient, http } from 'viem';
import { CONFIG } from '../../config';
import { eip712WalletActions } from 'viem/zksync';
import { privateKeyToAccount } from 'viem/accounts';

export const account = privateKeyToAccount(CONFIG.walletPrivateKey as '0x${string}');
export const wallet = createWalletClient({
  account: privateKeyToAccount(CONFIG.walletPrivateKey as '0x${string}'),
  chain: CONFIG.chain,
  transport: http(),
}).extend(eip712WalletActions());

export const network = createPublicClient({ chain: CONFIG.chain, transport: http() });
