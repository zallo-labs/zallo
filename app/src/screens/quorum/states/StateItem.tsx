import { Quorum } from 'lib';
import { RadioButton } from 'react-native-paper';
import { Addr } from '~/components/addr/Addr';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { useProposal } from '~/queries/proposal/useProposal.api';
import { isRemoval, Proposable, Removal } from '~/queries/quroum';

export interface StateItemProps {
  state: Proposable<Quorum | Removal>;
  selected: boolean;
  select?: () => void;
  isActiveState?: boolean;
}

export const StateItem = ({ state, selected, select, isActiveState }: StateItemProps) => {
  const proposal = useProposal(state.proposal);

  const lines = proposal && isRemoval(state) ? 2 : proposal || isRemoval(state) ? 1 : undefined;

  return (
    <ListItem
      leading={({ disabled }) => (
        <RadioButton status={selected ? 'checked' : 'unchecked'} value="" disabled={disabled} />
      )}
      headline={proposal ? <Timestamp timestamp={proposal.proposedAt} /> : 'Account creation'}
      supporting={
        lines && (
          <>
            {proposal && (
              <>
                Proposed by <Addr addr={proposal.proposer} />
              </>
            )}

            {lines === 2 && <>{'\n'}</>}

            {isRemoval(state) && <>Quorum removal</>}
          </>
        )
      }
      trailing={
        isActiveState
          ? 'active'
          : proposal?.state === 'pending'
          ? `${proposal.approvals.size || 'No'} approvals`
          : proposal?.state
      }
      lines={lines}
      selected={selected}
      onPress={select}
      disabled={!select}
    />
  );
};
