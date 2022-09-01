import assert from 'assert';
import { createContext, ReactNode, useContext } from 'react';
import { Suspend } from '~/components/Suspender';
import { CombinedAccount } from '~/queries/account';
import { useAccount } from '~/queries/account/useAccount';
import { Tx, TxId } from '~/queries/tx';
import { useTx } from '~/queries/tx/tx/useTx';
import { useWallet } from '~/queries/wallet/useWallet';
import { CombinedWallet } from '~/queries/wallets';

interface TransactionContext {
  tx: Tx;
  account: CombinedAccount;
  wallet: CombinedWallet;
}

const CONTEXT = createContext<TransactionContext | null>(null);

export const useTxContext = () => {
  const v = useContext(CONTEXT);
  assert(v);
  return v;
};

export interface TransactionContextProps {
  children: ReactNode;
  id: TxId;
}

export const TransactionProvider = ({
  children,
  id,
}: TransactionContextProps) => {
  const { tx } = useTx(id);
  const { account } = useAccount(tx?.account);
  const wallet = useWallet(tx?.wallet);

  if (!tx || !account || !wallet) return <Suspend />;

  return (
    <CONTEXT.Provider value={{ tx, account, wallet }}>
      {children}
    </CONTEXT.Provider>
  );
};
