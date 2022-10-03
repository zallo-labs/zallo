import { Addr } from '~/components/addr/Addr';
import { CheckIcon } from '~/util/theme/icons';
import { Approval } from '~/queries/proposal';
import { EventRow } from './EventRow';
import { useTxContext } from '../../TransactionProvider';

export interface ApprovalRowProps {
  approval: Approval;
}

export const ApprovalRow = ({ approval }: ApprovalRowProps) => (
  <EventRow
    Icon={CheckIcon}
    content={
      <>
        <Addr addr={approval.addr} account={useTxContext().account} /> approved
      </>
    }
    timestamp={approval.timestamp}
  />
);
