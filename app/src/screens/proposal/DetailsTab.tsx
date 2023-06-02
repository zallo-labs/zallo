import { ProposalId, useProposal } from '@api/proposal';
import { makeStyles } from '@theme/makeStyles';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { useTransfersValue } from '~/components/call/useTransfersValue';
import { FiatValue } from '~/components/fiat/FiatValue';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from './Tabs';
import { FeeToken } from './FeeToken';

export interface DetailsTabParams {
  proposal: ProposalId;
}

export type DetailsTabProps = TabNavigatorScreenProp<'Details'>;

export const DetailsTab = withSuspense(({ route }: DetailsTabProps) => {
  const styles = useStyles();
  const p = useProposal(route.params.proposal);
  const transfers = p.transaction?.receipt?.transfers ?? p.simulation?.transfers ?? [];
  const transfersValue = useTransfersValue(transfers);

  const to = transfers.find((t) => t.token === p.to)?.to ?? p.to;

  console.log(p.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ListItem leading={to} headline="To" trailing={useAddressLabel(to)} />
      <ListItem leading={p.account} headline="From" trailing={useAddressLabel(p.account)} />
      <ListItem
        leading={p.proposedBy}
        headline="Proposer"
        trailing={useAddressLabel(p.proposedBy)}
      />
      <FeeToken proposal={p} />

      {transfers.length > 0 && (
        <ListHeader
          {...(transfers.length > 1 && {
            trailing: (
              <Text variant="labelLarge" style={styles.transfersHeaderSupporting}>
                <FiatValue value={transfersValue} />
              </Text>
            ),
          })}
        >
          Transfers
        </ListHeader>
      )}

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
