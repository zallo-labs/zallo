import { ProposalId, useProposal } from '@api/proposal';
import { GasIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ICON_SIZE } from '@theme/paper';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { useTransfersValue } from '~/components/call/useTransfersValue';
import { FiatValue } from '~/components/fiat/FiatValue';
import { FormattedNumber } from '~/components/format/FormattedNumber';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TokenItem } from '~/components/token/TokenItem';
import { ApprovalActions } from './ApprovalActions';
import { TabNavigatorScreenProp } from './Tabs';

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ListItem leading={to} headline="To" trailing={useAddressLabel(to)} />
      <ListItem leading={p.account} headline="From" trailing={useAddressLabel(p.account)} />
      <ListItem leading={p.proposer} headline="Proposer" trailing={useAddressLabel(p.proposer)} />
      <ListItem
        leading={(props) => <GasIcon {...props} size={ICON_SIZE.medium} />}
        headline="Gas limit"
        trailing={p.gasLimit ? <FormattedNumber value={p.gasLimit} /> : 'Dynamic'}
      />

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

      {transfers.map((t, i) => (
        <TokenItem key={i} token={t.token} amount={t.amount} account={p.account} />
      ))}

      <ApprovalActions proposal={p} />
    </ScrollView>
  );
}, TabScreenSkeleton);

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  transfersHeaderSupporting: {
    color: colors.onSurfaceVariant,
  },
}));
