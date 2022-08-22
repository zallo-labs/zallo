import { makeStyles } from '@util/theme/makeStyles';
import { ProposableState } from '~/queries/wallets';
import { As, AsType } from './As';

type ShownState = Exclude<ProposableState, 'active'>;

const isShownState = (
  state: ProposableState | undefined,
): state is ShownState => state === 'added' || state === 'removed';

const LABEL: Record<ShownState, string> = {
  added: 'Added',
  removed: 'Removed',
};

export interface ProposalableStatusProps {
  state: ProposableState | undefined;
  as: AsType;
}

export const ProposalableStatus = ({ state, as }: ProposalableStatusProps) => {
  const styles = useStyles();

  if (!isShownState(state)) return null;

  return (
    <As as={as} style={state === 'added' ? styles.added : styles.removed}>
      {LABEL[state]}
    </As>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  added: {
    color: colors.success,
  },
  removed: {
    color: colors.error,
  },
}));
