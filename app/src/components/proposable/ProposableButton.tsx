import { Chip } from 'react-native-paper';
import { Proposable } from '~/gql/proposable';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { ProposableIcon } from './ProposableIcon';

const LABEL = {
  modify: 'View modification proposal',
  add: 'View addition proposal',
  remove: 'View removal proposal',
} as const;

export interface ProposableButtonProps {
  proposable: Proposable<unknown>;
}

export const ProposableButton = ({ proposable: p }: ProposableButtonProps) => {
  const { navigate } = useRootNavigation();

  if (p.status === 'active' || !p.proposal) return null;

  const proposal = p.proposal;
  return (
    <Chip
      mode={proposal ? 'outlined' : 'outlined'}
      icon={(props) => <ProposableIcon proposable={p} {...props} />}
      onPress={() => navigate('Transaction', { id: proposal })}
    >
      {LABEL[p.status]}
    </Chip>
  );
};
