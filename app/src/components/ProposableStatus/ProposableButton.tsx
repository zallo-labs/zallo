import { Chip } from 'react-native-paper';
import { getProposableStatus, Proposable } from '~/gql/proposable';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { ProposableIcon } from './ProposableIcon';

const LABEL = {
  active: 'Modification proposed',
  add: 'Addition proposed',
  remove: 'Removal proposed',
} as const;

export interface ProposableButtonProps {
  proposable: Proposable<unknown>;
}

export const ProposableButton = ({ proposable: p }: ProposableButtonProps) => {
  const { navigate } = useRootNavigation();

  const status = getProposableStatus(p);
  if (status === 'active' && !p.proposal) return null;

  const proposal = p.proposal;
  return (
    <Chip
      mode={proposal ? 'flat' : 'outlined'}
      icon={(props) => <ProposableIcon proposable={p} {...props} />}
      {...(proposal && {
        onPress: () => navigate('Transaction', { id: proposal }),
      })}
    >
      {LABEL[status]}
    </Chip>
  );
};
