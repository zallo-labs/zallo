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
import { StateItem } from './StateItem';

export interface StateCardProps {
  proposal: Proposal;
  style?: StyleProp<ViewStyle>;
}

export const StateCard = ({ proposal: p, style }: StateCardProps) => {
  const styles = useStyles();

  const status = match(p.state)
    .with('pending', () => {
      if (p.satisfiablePolicies.find((p) => p.satisfied)) return 'approved';
      if (p.rejections.size > 0) return 'rejected';
      return 'pending';
    })
    .otherwise((status) => status);

  return (
    <Card style={[style]} touchableStyle={styles.card}>
      {/* TODO: Satisfiable policies state card */}
      {/* <StateItem
        Icon={CircleOutlineIcon}
        title="Awaiting approval"
        events={[...p.awaitingApproval].map((addr) => ({ addr }))}
        selected={status === 'pending'}
      /> */}

      {status === 'rejected' && (
        <StateItem
          Icon={RejectedCircleIcon}
          title="Rejected"
          events={[...p.rejections.values()]}
          selected="error"
        />
      )}

      <StateItem
        Icon={CheckCircleIcon}
        title="Approved"
        events={[...p.approvals.values()]}
        selected={status === 'approved'}
      />

      {status === 'executing' && (
        <StateItem
          Icon={({ color }) => <ActivityIndicator color={color as string} size="small" />}
          title="Executing"
          timestamp={p.transaction?.timestamp}
          selected
        />
      )}

      <StateItem
        Icon={CheckmarkDoneCircleIcon}
        title="Executed"
        timestamp={p.transaction?.timestamp}
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
