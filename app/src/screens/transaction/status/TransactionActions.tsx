import { Proposal } from '~/queries/proposal';
import { FailedActions } from './FailedActions';
import { ProposeActions } from './ProposeActions';

export interface TransactionActionsProps {
  proposal: Proposal;
}

export const TransactionActions = ({ proposal }: TransactionActionsProps) => {
  if (proposal.status === 'proposed')
    return <ProposeActions />;

  if (proposal.status === 'failed') return <FailedActions />;

  return null;
};
