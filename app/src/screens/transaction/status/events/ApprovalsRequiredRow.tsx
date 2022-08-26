import { QuorumIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { Tx } from '~/queries/tx';
import { CombinedWallet } from '~/queries/wallets';

export interface ApprovalsRequiredRowProps {
  tx: Tx;
  wallet: CombinedWallet;
}

export const ApprovalsRequiredRow = ({
  tx,
  wallet,
}: ApprovalsRequiredRowProps) => {
  const styles = useStyles();

  const quorum = wallet.quorums.sort(
    (a, b) => a.approvers.length - b.approvers.length,
  )[0];

  const remaining = quorum.approvers.filter((approver) =>
    tx.approvals.every((approval) => approval.addr !== approver),
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
