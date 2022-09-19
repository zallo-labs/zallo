import { Chip } from 'react-native-paper';
import { Proposable } from '~/gql/proposable';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { ProposableIcon } from './ProposableIcon';

const LABEL = {
  modify: 'Modification proposed',
  add: 'Addition proposed',
  remove: 'Removal proposed',
} as const;

export interface ProposableButtonProps {
  proposable: Proposable<unknown>;
}

export const ProposableButton = ({ proposable: p }: ProposableButtonProps) => {
  const { navigate } = useRootNavigation();

  if (p.status === 'active') return null;

  const proposal = p.proposal;
  return (
    <Chip
      mode={proposal ? 'flat' : 'outlined'}
      icon={(props) => <ProposableIcon proposable={p} {...props} />}
      {...(proposal && {
        onPress: () => navigate('Transaction', { id: proposal }),
      })}
    >
      {LABEL[p.status]}
    </Chip>
  );
};
