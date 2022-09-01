import { ZERO } from 'lib';
import { useWallet } from '~/queries/wallet/useWallet';
import { WalletId } from '~/queries/wallets';
import { Token } from './token';
import { useTokenBalance } from './useTokenBalance';

export const useTokenAvailable = (token: Token, walletId?: WalletId) => {
  const wallet = useWallet(walletId);
  const balance = useTokenBalance(token, walletId?.accountAddr);

  const limit = wallet?.limits.tokens[token.addr]?.active;
  if (limit?.amount) return limit.amount;

  if (wallet?.limits.allowlisted) return ZERO;

  return balance;
};
