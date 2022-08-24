import { Addr } from '~/components/addr/Addr';
import { CheckIcon } from '~/util/theme/icons';
import { Approval } from '~/queries/tx';
import { EventRow } from './EventRow';

export interface ApprovalRowProps {
  approval: Approval;
}

export const ApprovalRow = ({ approval }: ApprovalRowProps) => (
  <EventRow
    Icon={CheckIcon}
    content={
      <>
        <Addr addr={approval.addr} /> approved
      </>
    }
    timestamp={approval.timestamp}
  />
);
