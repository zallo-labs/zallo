import { ProposalId, useProposal } from '@api/proposal';
import { useGasPrice } from '@network/useGasPrice';
import { CheckIcon, ClockOutlineIcon, CloseIcon, GasOutlineIcon } from '@theme/icons';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { StyleSheet, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { match } from 'ts-pattern';
import { FiatValue } from '~/components/fiat/FiatValue';
import { FormattedNumber } from '~/components/format/FormattedNumber';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TokenAmount } from '~/components/token/TokenAmount';
import { TokenIcon } from '~/components/token/TokenIcon/TokenIcon';
import { TabNavigatorScreenProp } from './Tabs';
import { TabBadge } from '~/components/tab/TabBadge';
import { makeStyles } from '@theme/makeStyles';

const Item = (props: ListItemProps) => (
  <ListItem
    {...props}
    trailing={
      props.trailing ? ({ Text }) => <Text variant="bodyMedium">{props.trailing}</Text> : undefined
    }
  />
);

export interface TransactionTabParams {
  proposal: ProposalId;
}

export type TransactionTabProps = TabNavigatorScreenProp<'Transaction'>;

export const TransactionTab = withSuspense(({ route }: TransactionTabProps) => {
  const styles = useStyles();
  const proposal = useProposal(route.params.proposal);
  const tx = proposal.transaction;
  const receipt = tx?.receipt;

  const feeToken = useMaybeToken(proposal.feeToken) ?? ETH;
  const currentGasPrice = useGasPrice(feeToken);
  const gasPrice = tx?.gasPrice;
  const estimatedFee = currentGasPrice * proposal.gasLimit;
  const actualFee = receipt && receipt.gasUsed * tx.gasPrice;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {match(tx)
        .with(undefined, () => (
          <Item
            leading={ClockOutlineIcon}
            headline="Status"
            trailing="Awaiting for policy to be satisfied"
          />
        ))
        .with({ status: 'pending' }, () => (
          <Item
            leading={({ size }) => <ActivityIndicator size={size} />}
            headline="Status"
            trailing="Executing"
          />
        ))
        .with({ status: 'success' }, () => (
          <Item leading={CheckIcon} headline="Status" trailing="Success" />
        ))
        .with({ status: 'failure' }, () => (
          <Item
            leading={CloseIcon}
            headline="Status"
            trailing={({ Text }) => <Text style={styles.failed}>Failed</Text>}
          />
        ))
        .exhaustive()}

      {tx && (
        <Item
          leading={ClockOutlineIcon}
          headline="Submitted"
          trailing={<Timestamp timestamp={tx.timestamp} />}
        />
      )}

      {receipt && (
        <Item
          leading={ClockOutlineIcon}
          headline="Executed"
          trailing={<Timestamp timestamp={receipt.timestamp} />}
        />
      )}

      <Item
        leading={GasOutlineIcon}
        headline="Gas limit"
        trailing={<FormattedNumber value={proposal.gasLimit} />}
      />

      {receipt && (
        <Item
          leading={GasOutlineIcon}
          headline="Gas used"
          trailing={<FormattedNumber value={receipt.gasUsed} />}
        />
      )}

      {gasPrice ? (
        <Item
          leading={GasOutlineIcon}
          headline="Gas price"
          trailing={<TokenAmount token={feeToken} amount={gasPrice} />}
        />
      ) : (
        <Item
          leading={GasOutlineIcon}
          headline="Gas price (current)"
          trailing={<TokenAmount token={feeToken} amount={currentGasPrice} />}
        />
      )}

      {actualFee ? (
        <Item
          leading={(props) => <TokenIcon token={feeToken} {...props} />}
          headline="Network fee"
          supporting={<TokenAmount token={feeToken} amount={actualFee} />}
          trailing={<FiatValue value={{ token: feeToken, amount: actualFee }} />}
        />
      ) : (
        <Item
          leading={(props) => <TokenIcon token={feeToken} {...props} />}
          headline="Network fee (estimated)"
          supporting={<TokenAmount token={feeToken} amount={estimatedFee} />}
          trailing={<FiatValue value={{ token: feeToken, amount: estimatedFee }} />}
        />
      )}
    </ScrollView>
  );
}, TabScreenSkeleton);

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  failed: {
    color: colors.error,
  },
}));

export interface TransactionTabBadgeProps {
  proposal: ProposalId;
}

export const TransactionTabBadge = ({ proposal: id }: TransactionTabBadgeProps) => {
  const { state } = useProposal(id);

  return (
    <TabBadge visible={state === 'executing' || state === 'failed'} style={badgeStyles.badge} />
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    transform: [{ translateX: -8 }],
  },
});
