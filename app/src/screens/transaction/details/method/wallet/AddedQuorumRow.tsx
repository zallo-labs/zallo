import { AddIcon, CloseIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import assert from 'assert';
import { AddrList } from '~/components/addr/AddrList';
import { Box } from '~/components/layout/Box';
import { CombinedQuorum } from '~/queries/wallets';

export interface AddedQuorumRowProps {
  quorum: CombinedQuorum;
}

export const AddedOrRemovedQuorumRow = ({ quorum }: AddedQuorumRowProps) => {
  assert(quorum.state.status !== 'active');
  const styles = useStyles();

  const Icon = quorum.state.status === 'add' ? AddIcon : CloseIcon;

  return (
    <Box horizontal alignItems="center">
      <Icon style={styles.icon} />
      <AddrList addresses={quorum.approvers} />
    </Box>
  );
};

const useStyles = makeStyles(({ colors, space }) => ({
  icon: {
    color: colors.onSurface,
    marginRight: space(2),
  },
}));
