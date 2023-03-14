import { makeStyles } from '@theme/makeStyles';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { useTokenValue } from '@token/useTokenValue';
import { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useProposalTransfers } from '~/components/call/useProposalTransfers';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Item } from '~/components/item/Item';
import { Box } from '~/components/layout/Box';
import { TokenAmount } from '~/components/token/TokenAmount';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';
import { Proposal } from '@api/proposal';
import { Transfer } from '@subgraph/transfer';

interface ProposalTransferProps {
  proposal: Proposal;
  transfer: Transfer;
}

export const ProposalTransfer = memo(({ proposal, transfer }: ProposalTransferProps) => {
  const balance = useTokenAvailable(transfer.token, proposal.account);
  const insufficient = balance < transfer.amount && proposal.state !== 'executed';
  const styles = useStyles(insufficient);

  return (
    <Item
      Left={<TokenIcon token={transfer.token} />}
      Main={[
        insufficient && (
          <Text variant="bodyMedium" style={styles.main}>
            Insufficient balance
          </Text>
        ),
        <Text variant="titleMedium" style={styles.main}>
          <TokenAmount token={transfer.token} amount={transfer.amount} />
        </Text>,
      ]}
      Right={
        <Text variant="bodyLarge">
          <FiatValue value={useTokenValue(transfer.token, transfer.amount)} />
        </Text>
      }
    />
  );
});

const useStyles = makeStyles(({ colors }, insufficient: boolean) => ({
  main: {
    ...(insufficient && { color: colors.error }),
  },
}));

export interface ProposalTransfersProps {
  proposal: Proposal;
  style?: StyleProp<ViewStyle>;
}

export const ProposalTransfers = ({ proposal, style }: ProposalTransfersProps) => {
  const transfers = useProposalTransfers(proposal);

  if (!transfers.length) return null;

  return (
    <Box style={style}>
      {transfers.map((transfer) => (
        <ProposalTransfer key={transfer.token.addr} proposal={proposal} transfer={transfer} />
      ))}
    </Box>
  );
};
