import {
  RejectedCircleIcon,
  CheckCircleIcon,
  CircleOutlineIcon,
  CheckmarkDoneCircleIcon,
} from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { match } from 'ts-pattern';
import { Card } from '~/components/card/Card';
import { Proposal } from '~/queries/proposal';
import { State } from './State';
import { useProposalApprovers } from './useProposalApprovers';

export interface ProposalStatusCardProps {
  proposal: Proposal;
  style?: StyleProp<ViewStyle>;
}

export const ProposalStatusCard = ({ proposal, style }: ProposalStatusCardProps) => {
  const styles = useStyles();
  const { approved, notApproved, rejected, isApproved } = useProposalApprovers(proposal);

  const status = match(proposal.status)
    .with('proposed', () => {
      if (isApproved) return 'approved';
      if (rejected.size > 0) return 'rejected';
      return 'proposed';
    })
    .otherwise((status) => status);

  return (
    <Card style={[style]} touchableStyle={styles.card}>
      {status === 'proposed' && (
        <State
          Icon={CircleOutlineIcon}
          title="Awaiting approval"
          events={[...notApproved].map((addr) => ({ addr }))}
          selected={status === 'proposed'}
        />
      )}

      {status === 'rejected' && (
        <State
          Icon={RejectedCircleIcon}
          title="Rejected"
          events={[...rejected.values()]}
          selected="error"
        />
      )}

      <State
        Icon={CheckCircleIcon}
        title="Approved"
        events={[...approved.values()]}
        selected={status === 'approved'}
      />

      {status === 'pending' && (
        <State
          Icon={({ color }) => <ActivityIndicator color={color as string} size="small" />}
          title="Pending"
          timestamp={proposal.submissions[proposal.submissions.length - 1]?.timestamp}
          selected
        />
      )}

      <State
        Icon={CheckmarkDoneCircleIcon}
        title="Finalized"
        timestamp={proposal.submissions[proposal.submissions.length - 1]?.timestamp}
        selected={status === 'executed'}
      />
    </Card>
  );
};

const useStyles = makeStyles(() => ({
  card: {
    padding: 0,
  },
}));
