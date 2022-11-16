import { QuorumIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { Proposal } from '~/queries/proposal';
import { CombinedUser } from '~/queries/user/useUser.api';

export interface ApprovalsRequiredRowProps {
  proposal: Proposal;
  proposer: CombinedUser;
}

export const ApprovalsRequiredRow = ({ proposal, proposer }: ApprovalsRequiredRowProps) => {
  const styles = useStyles();
  const config = (proposer.configs.active ?? proposer.configs.proposed)!.sort(
    (a, b) => a.approvers.length - b.approvers.length,
  )[0];

  const remaining = config.approvers.filter((approver) =>
    proposal.approvals.every((approval) => approval.addr !== approver),
  ).length;

  const label = match(remaining)
    .with(0, () => 'No approvals required')
    .with(1, () => '1 approval required')
    .otherwise((remaining) => `${remaining} approvals required`);

  return (
    <Container horizontal alignItems="center" separator={<Box mx={1} />}>
      <QuorumIcon style={styles.content} />

      <Text variant="titleSmall" style={styles.content}>
        {label}
      </Text>
    </Container>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  content: {
    color: colors.primary,
  },
}));
