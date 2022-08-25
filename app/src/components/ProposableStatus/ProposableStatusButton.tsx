import { Chip } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { ProposableState } from '~/queries/wallets';
import { ProposableStatusIcon } from './ProposableStatusIcon';

const LABEL = {
  active: 'Modification proposed',
  add: 'Addition proposed',
  remove: 'Removal proposed',
} as const;

export interface ProposableStatusButtonProps {
  state: ProposableState;
}

export const ProposableStatusButton = ({
  state,
}: ProposableStatusButtonProps) => {
  const { navigate } = useRootNavigation();

  if (state.status === 'active' && !state.proposedModification) return null;

  const proposedModification = state.proposedModification;
  return (
    <Chip
      mode={proposedModification ? 'flat' : 'outlined'}
      icon={(props) => <ProposableStatusIcon state={state} {...props} />}
      {...(proposedModification && {
        onPress: () => navigate('Transaction', { id: proposedModification }),
      })}
    >
      {LABEL[state.status]}
    </Chip>
  );
};
