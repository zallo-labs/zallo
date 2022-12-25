import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { makeStyles } from '~/util/theme/makeStyles';
import { Proposal, ProposalId } from '~/queries/proposal';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useProposalLabel } from '../../components/call/useProposalLabel';
import { useProposalTransfers } from '~/components/call/useProposalTransfers';
import { useProposal } from '~/queries/proposal/useProposal.api';
import { ItemSkeleton } from '~/components/item/ItemSkeleton';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';
import { Box } from '~/components/layout/Box';
import { Text, TouchableRipple } from 'react-native-paper';
import { Addr } from '~/components/addr/Addr';
import { ActivityTransfers } from './ActivityTransfers';
import { match } from 'ts-pattern';
import { Timestamp } from '~/components/format/Timestamp';

const Status = ({ p }: { p: Proposal }) => {
  const styles = useStyles();

  return match(p)
    .with({ state: 'pending', userHasApproved: false }, () => (
      <Text variant="labelLarge" style={styles.primaryColor}>
        Awaiting approval
      </Text>
    ))
    .with({ state: 'pending' }, () => (
      <Text variant="labelLarge" style={styles.secondaryColor}>
        Awaiting approval from others
      </Text>
    ))
    .with({ state: 'executed' }, () => (
      <Text variant="bodyMedium">
        <Timestamp timestamp={p.timestamp} weekday />
      </Text>
    ))
    .with({ state: 'failed' }, { state: 'executing' }, ({ state }) => (
      <Text variant="labelLarge">{state}</Text>
    ))
    .exhaustive();
};

export interface ProposalItemProps {
  id: ProposalId;
  onPress?: () => void;
}

export const ProposalItem = withSkeleton(({ id, onPress }: ProposalItemProps) => {
  const styles = useStyles();
  const [p] = useProposal(id);
  const token = useMaybeToken(p.to) ?? ETH;
  const label = useProposalLabel(p);

  return (
    <TouchableRipple onPress={onPress} style={styles.container}>
      <>
        <TokenIcon token={token} style={styles.icon} />

        <Box flex={1}>
          <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
            {`${label} to `}
            <Addr addr={p.to} />
          </Text>
          <Status p={p} />
        </Box>

        <Box alignItems="flex-end">
          <ActivityTransfers transfers={useProposalTransfers(p)} />
        </Box>
      </>
    </TouchableRipple>
  );
}, ItemSkeleton);

const useStyles = makeStyles(({ colors, space, typoSpace }) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: space(1),
    paddingHorizontal: space(2),
  },
  icon: {
    marginRight: space(2),
  },
  title: {
    marginRight: typoSpace(1),
  },
  primaryColor: {
    color: colors.primary,
  },
  secondaryColor: {
    color: colors.secondary,
  },
}));
