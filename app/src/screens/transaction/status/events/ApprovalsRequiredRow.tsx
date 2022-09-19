import { QuorumIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { Proposal } from '~/queries/proposal';
import { CombinedUser } from '~/queries/user/useUser.api';

export interface ApprovalsRequiredRowProps {
  proposal: Proposal;
  proposer: CombinedUser;
}

export const ApprovalsRequiredRow = ({
  proposal,
  proposer,
}: ApprovalsRequiredRowProps) => {
  const styles = useStyles();

  const config = (proposer.configs.active ?? []).sort(
    (a, b) => a.approvers.length - b.approvers.length,
  )[0];

  const remaining = config.approvers.filter((approver) =>
    proposal.approvals.every((approval) => approval.addr !== approver),
  ).length;

  return (
    <Container horizontal alignItems="center" separator={<Box mx={1} />}>
      <QuorumIcon style={styles.content} />

      <Text
        variant="titleSmall"
        style={styles.content}
      >{`At least ${remaining} approval${
        remaining > 1 ? 's' : ''
      } remaining`}</Text>
    </Container>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  content: {
    color: colors.primary,
  },
}));
