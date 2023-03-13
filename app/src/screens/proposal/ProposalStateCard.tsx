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
import { Proposal } from '@api/proposal';
import { State } from './State';

export interface ProposalStateCardProps {
  proposal: Proposal;
  style?: StyleProp<ViewStyle>;
}

export const ProposalStateCard = ({ proposal: p, style }: ProposalStateCardProps) => {
  const styles = useStyles();

  const status = match(p.state)
    .with('pending', () => {
      if (p.isApproved) return 'approved';
      if (p.rejected.size > 0) return 'rejected';
      return 'pending';
    })
    .otherwise((status) => status);

  return (
    <Card style={[style]} touchableStyle={styles.card}>
      {status === 'pending' && (
        <State
          Icon={CircleOutlineIcon}
          title="Awaiting approval"
          events={[...p.awaitingApproval].map((addr) => ({ addr }))}
          selected={status === 'pending'}
        />
      )}

      {status === 'rejected' && (
        <State
          Icon={RejectedCircleIcon}
          title="Rejected"
          events={[...p.rejected.values()]}
          selected="error"
        />
      )}

      <State
        Icon={CheckCircleIcon}
        title="Approved"
        events={[...p.approvals.values()]}
        selected={status === 'approved'}
      />

      {status === 'executing' && (
        <State
          Icon={({ color }) => <ActivityIndicator color={color as string} size="small" />}
          title="Executing"
          timestamp={p.submissions[p.submissions.length - 1]?.timestamp}
          selected
        />
      )}

      <State
        Icon={CheckmarkDoneCircleIcon}
        title="Executed"
        timestamp={p.submissions[p.submissions.length - 1]?.timestamp}
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
