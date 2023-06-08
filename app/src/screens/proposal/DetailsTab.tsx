import { ProposalId, useProposal } from '@api/proposal';
import { makeStyles } from '@theme/makeStyles';
import { ScrollView } from 'react-native';
import { useTransfersValue } from '~/components/call/useTransfersValue';
import { FiatValue } from '~/components/fiat/FiatValue';
import { ListHeader } from '~/components/list/ListHeader';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from './Tabs';
import { FeeToken } from './FeeToken';
import { OperationSection } from './OperationSection';

export interface DetailsTabParams {
  proposal: ProposalId;
}

export type DetailsTabProps = TabNavigatorScreenProp<'Details'>;

export const DetailsTab = withSuspense(({ route }: DetailsTabProps) => {
  const styles = useStyles();
  const p = useProposal(route.params.proposal);
  const transfers = p.transaction?.receipt?.transfers ?? p.simulation?.transfers ?? [];
  const transfersValue = useTransfersValue(transfers);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {p.operations.map((op, i) => (
        <OperationSection
          key={i}
          proposal={p}
          op={op}
          initiallyExpanded={p.operations.length === 1}
        />
      ))}

      <ListHeader
        trailing={({ Text }) => (
          <Text>
            <FiatValue value={transfersValue} />
          </Text>
        )}
      >
        Transfers
      </ListHeader>
      <FeeToken proposal={p} />

      {transfers.map((t, i) => (
        <TokenItem key={i} token={t.token} amount={t.amount} account={p.account} />
      ))}
    </ScrollView>
  );
}, TabScreenSkeleton);

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  transfersHeaderSupporting: {
    color: colors.onSurfaceVariant,
  },
}));
