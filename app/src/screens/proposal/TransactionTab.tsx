import { CheckIcon, ClockOutlineIcon, CloseIcon, GasOutlineIcon } from '@theme/icons';
import { ScrollView } from 'react-native';
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
import { makeStyles } from '@theme/makeStyles';
import { Hex, asBigInt, tokenToFiat } from 'lib';
import { ReactNode } from 'react';
import { gql, useFragment } from '@api/generated';
import { tryReplaceDocument, useQuery } from '~/gql';
import { useSubscription } from 'urql';

const TransactionProposal = gql(/* GraphQL */ `
  fragment TransactionTab_TransactionProposalFragment on TransactionProposal {
    id
    status
    feeToken {
      id
      address
      gasPrice
      decimals
      price {
        id
        current
      }
      ...TokenAmount_token
      ...UseFormattedTokenAmount_token
    }
    gasLimit
    transaction {
      id
      gasPrice
      submittedAt
      receipt {
        id
        gasUsed
        timestamp
      }
    }
  }
`);

const Query = gql(/* GraphQL */ `
  query TransactionTab($proposal: Bytes32!) {
    proposal(input: { hash: $proposal }) {
      ...TransactionTab_TransactionProposalFragment
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription TransactionTab_Subscription($proposal: Bytes32!) {
    proposal(input: { proposals: [$proposal] }) {
      ...TransactionTab_TransactionProposalFragment
    }
  }
`);

const Item = (props: Omit<ListItemProps, 'trailing'> & { trailing: ReactNode }) => (
  <ListItem
    {...props}
    trailing={
      props.trailing ? ({ Text }) => <Text variant="bodyMedium">{props.trailing}</Text> : undefined
    }
  />
);

export interface TransactionTabParams {
  proposal: Hex;
}

export type TransactionTabProps = TabNavigatorScreenProp<'Transaction'>;

export const TransactionTab = withSuspense(({ route }: TransactionTabProps) => {
  const styles = useStyles();

  const { data } = useQuery(Query, { proposal: route.params.proposal });
  useSubscription({
    query: tryReplaceDocument(Subscription),
    variables: { proposal: route.params.proposal },
  });
  const p = useFragment(TransactionProposal, data?.proposal);

  const tx = p?.transaction;
  const receipt = tx?.receipt;

  if (!p) return null;

  const estimatedFee = asBigInt(p.feeToken.gasPrice ?? 0) * asBigInt(p.gasLimit);
  const actualFee = receipt && asBigInt(receipt.gasUsed) * asBigInt(tx.gasPrice);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {match(p)
        .with({ status: 'Pending' }, () => (
          <Item leading={ClockOutlineIcon} headline="Status" trailing="Pending" />
        ))
        .with({ status: 'Executing' }, () => (
          <Item
            leading={({ size }) => <ActivityIndicator size={size} />}
            headline="Status"
            trailing="Executing"
          />
        ))
        .with({ status: 'Successful' }, () => (
          <Item leading={CheckIcon} headline="Status" trailing="Success" />
        ))
        .with({ status: 'Failed' }, () => (
          <ListItem
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
          trailing={<Timestamp timestamp={tx.submittedAt} />}
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
        trailing={<FormattedNumber value={p.gasLimit} />}
      />

      {receipt && (
        <Item
          leading={GasOutlineIcon}
          headline="Gas used"
          trailing={<FormattedNumber value={receipt.gasUsed} />}
        />
      )}

      {tx?.gasPrice ? (
        <Item
          leading={GasOutlineIcon}
          headline="Gas price"
          trailing={<TokenAmount token={p.feeToken} amount={tx.gasPrice} />}
        />
      ) : (
        <Item
          leading={GasOutlineIcon}
          headline="Gas price (current)"
          trailing={<TokenAmount token={p.feeToken} amount={p.feeToken.gasPrice ?? 0} />}
        />
      )}

      {actualFee ? (
        <Item
          leading={(props) => <TokenIcon token={p.feeToken.address} {...props} />}
          headline="Network fee"
          supporting={<TokenAmount token={p.feeToken} amount={actualFee} />}
          trailing={
            <FiatValue
              value={tokenToFiat(actualFee, p.feeToken.price?.current ?? 0, p.feeToken.decimals)}
            />
          }
        />
      ) : (
        <Item
          leading={(props) => <TokenIcon token={p.feeToken.address} {...props} />}
          headline="Network fee (estimated)"
          supporting={<TokenAmount token={p.feeToken} amount={estimatedFee} />}
          trailing={
            <FiatValue
              value={tokenToFiat(estimatedFee, p.feeToken.price?.current ?? 0, p.feeToken.decimals)}
            />
          }
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
