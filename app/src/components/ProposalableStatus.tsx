import { useTheme } from '@theme/paper';
import assert from 'assert';
import { Button } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { TxId } from '~/queries/tx';
import { ProposableState } from '~/queries/wallets';

type ShownState = Exclude<ProposableState, 'active'>;

const isShownState = (
  state: ProposableState | undefined,
): state is ShownState => state === 'add' || state === 'remove';

const LABEL: Record<ShownState, string> = {
  add: 'Add',
  remove: 'Remove',
};

export interface ProposalableStatusProps {
  state: ProposableState | undefined;
  activeText?: string;
  proposal?: TxId;
}

export const ProposalableStatus = ({
  state,
  activeText,
  proposal,
}: ProposalableStatusProps) => {
  const { navigate } = useRootNavigation();
  const { colors } = useTheme();

  if (!state || (!isShownState(state) && !activeText)) return null;

  const label = LABEL[state as ShownState] || activeText;
  assert(label);

  return (
    <Button
      mode={proposal ? 'outlined' : 'text'}
      textColor={
        state === 'active'
          ? colors.primary
          : state === 'add'
          ? colors.success
          : colors.error
      }
      {...(proposal && {
        onPress: () => {
          navigate('Transaction', {
            id: proposal,
          });
        },
      })}
    >
      {label}
    </Button>
  );
};
