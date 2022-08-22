import { makeStyles } from '@util/theme/makeStyles';
import { ProposableState } from '~/queries/wallets';

const useStyles = makeStyles(({ colors }, state?: ProposableState) => {
  if (!state || state === 'active') return { proposable: {} };

  return {
    proposable: {
      borderWidth: 1,
      borderColor: state === 'added' ? colors.primary : colors.error,
    },
  };
});

export const useProposableStyle = (state?: ProposableState) =>
  useStyles(state).proposable;
