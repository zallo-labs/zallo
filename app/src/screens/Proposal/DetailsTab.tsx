import { ProposalId, useProposal } from '@api/proposal';
import { makeStyles } from '@theme/makeStyles';
import { memo } from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { useProposalTransfers } from '~/components/call/useProposalTransfers';
import { useTransfersValue } from '~/components/call/useTransfersValue';
import { FiatValue } from '~/components/fiat/FiatValue';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { TokenItem } from '~/components/token/TokenItem';
import { ApprovalActions } from './ApprovalActions';
import { TabNavigatorScreenProp } from './Tabs';

export interface DetailsTabParams {
  proposal: ProposalId;
}

export type DetailsTabProps = TabNavigatorScreenProp<'Details'>;

export const DetailsTab = memo(({ route }: DetailsTabProps) => {
  const styles = useStyles();
  const p = useProposal(route.params.proposal);
  const transfers = useProposalTransfers(p);
  const transfersValue = useTransfersValue(transfers);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ListItem leading={p.to} headline="To" trailing={useAddressLabel(p.to)} />
      <ListItem leading={p.account} headline="From" trailing={useAddressLabel(p.account)} />
      <ListItem leading={p.proposer} headline="Proposer" trailing={useAddressLabel(p.proposer)} />

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
});

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flex: 1,
  },
  transfersHeaderSupporting: {
    color: colors.onSurfaceVariant,
  },
}));
