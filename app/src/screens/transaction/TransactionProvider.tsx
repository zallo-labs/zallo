import assert from 'assert';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { CombinedAccount, useAccount } from '~/queries/account/useAccount.api';
import { Proposal, ProposalId } from '~/queries/proposal';
import { useProposal } from '~/queries/proposal/useProposal.api';
import { CombinedUser, useUser } from '~/queries/user/useUser.api';

interface TransactionContext {
  proposal: Proposal;
  account: CombinedAccount;
  proposer: CombinedUser;
}

const CONTEXT = createContext<TransactionContext | null>(null);

export const useTxContext = () => {
  const v = useContext(CONTEXT);
  assert(v);
  return v;
};

export interface TransactionContextProps {
  children: ReactNode;
  id: ProposalId;
}

export const TransactionProvider = ({
  children,
  id,
}: TransactionContextProps) => {
  const [proposal] = useProposal(id);
  const [account] = useAccount(proposal.account);
  const [proposer] = useUser(proposal.proposer);

  return (
    <CONTEXT.Provider
      value={useMemo(
        () => ({ proposal, account, proposer }),
        [account, proposal, proposer],
      )}
    >
      {children}
    </CONTEXT.Provider>
  );
};
