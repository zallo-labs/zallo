import assert from 'assert';
import { MaybePromise, UserConfig } from 'lib';
import { createContext, memo, ReactNode, useContext } from 'react';
import { TransactionResponse } from 'zksync-web3/build/src/types';
import { CombinedAccount, useAccount } from '~/queries/account/useAccount.api';
import { Proposal, ProposalId } from '~/queries/proposal';
import { useProposal } from '~/queries/proposal/useProposal.api';
import { CombinedUser, useUser } from '~/queries/user/useUser.api';

interface TransactionContext {
  proposal: Proposal;
  account: CombinedAccount;
  proposer: CombinedUser;
  onExecute?: OnExecute;
  config: UserConfig;
}

const CONTEXT = createContext<TransactionContext | null>(null);

export const useTxContext = () => {
  const v = useContext(CONTEXT);
  assert(v);
  return v;
};

export type OnExecute = (response: TransactionResponse) => MaybePromise<void>;

export interface TransactionContextProps {
  children: ReactNode;
  id: ProposalId;
  onExecute?: OnExecute;
}

export const TransactionProvider = memo(
  ({ children, id, onExecute }: TransactionContextProps) => {
    const [proposal] = useProposal(id);
    const [account] = useAccount(proposal.account);
    const [proposer] = useUser(proposal.proposer);

    // TODO: allow user to select config
    const config = (proposer.configs.active ?? proposer.configs.proposed!)[0];

    return (
      <CONTEXT.Provider
        value={{ proposal, account, proposer, onExecute, config }}
      >
        {children}
      </CONTEXT.Provider>
    );
  },
);
