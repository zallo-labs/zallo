import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { CombinedQuorum } from '~/queries/wallets';
import { AddIcon, CloseIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { AddrList } from '~/components/addr/AddrList';

interface AddedOrRemovedQuorumRowProps {
  quorum: CombinedQuorum;
}

const AddedOrRemovedQuorumRow = ({ quorum }: AddedOrRemovedQuorumRowProps) => {
  const styles = useStyles();

  const Icon = quorum.state.status === 'add' ? AddIcon : CloseIcon;

  return (
    <Box horizontal alignItems="center">
      <Icon style={styles.icon} />
      <AddrList addresses={quorum.approvers} />
    </Box>
  );
};

export interface ModifiedQuorumsProps {
  quorums: CombinedQuorum[];
}

export const ModifiedQuorums = ({ quorums }: ModifiedQuorumsProps) => {
  const modified = quorums.filter((q) => q.state.status !== 'active');

  if (modified.length === 0) return null;

  return (
    <Container separator={<Box mt={1} />}>
      <Text variant="titleSmall">Quorums</Text>

      {modified.map((q, i) => (
        <AddedOrRemovedQuorumRow key={i} quorum={q} />
      ))}
    </Container>
  );
};

const useStyles = makeStyles(({ colors, space }) => ({
  icon: {
    color: colors.onSurface,
    marginRight: space(2),
  },
}));
