import { Addr } from '~/components/addr/Addr';
import { CheckIcon } from '~/util/theme/icons';
import { Approval } from '~/queries/proposal';
import { EventRow } from './EventRow';

export interface ProposalRowProps {
  approval: Approval;
}

export const ProposalRow = ({ approval }: ProposalRowProps) => (
  <EventRow
    Icon={CheckIcon}
    content={
      <>
        <Addr addr={approval.addr} /> proposed
      </>
    }
    timestamp={approval.timestamp}
  />
);
