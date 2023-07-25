import { FragmentType, gql, useFragment } from '@api/generated';
import { ClockOutlineIcon } from '@theme/icons';
import { Address } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { useTimestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';

const FragmentDoc = gql(/* GraphQL */ `
  fragment OperationDetails_OperationFragment on Operation {
    to
    data
    function {
      __typename
      ... on GenericOp {
        _name
        _args
      }
      ... on AddPolicyOp {
        account
        key
      }
      ... on RemovePolicyOp {
        account
        key
      }
      ... on TransferOp {
        token
        to
        amount
      }
      ... on TransferFromOp {
        token
        from
        to
        amount
      }
      ... on TransferApprovalOp {
        token
        spender
        amount
      }
      ... on SwapOp {
        fromToken
        fromAmount
        toToken
        minimumToAmount
        deadline
      }
    }
  }
`);

export interface OperationDetailsProps {
  account: Address;
  operation: FragmentType<typeof FragmentDoc>;
}

export function OperationDetails({ account, ...props }: OperationDetailsProps) {
  const op = useFragment(FragmentDoc, props.operation);

  return match(op.function)
    .with({ __typename: 'TransferOp' }, (f) => (
      <>
        <ListItem leading={f.to} overline="To" headline={useAddressLabel(f.to)} />
        <ListItem leading={f.token} overline="Amount" headline={useFormattedTokenAmount(f)} />
      </>
    ))
    .with({ __typename: 'TransferFromOp' }, (f) => (
      <>
        <ListItem leading={f.token} headline={useFormattedTokenAmount(f)} />
        {account !== f.from && (
          <ListItem leading={f.from} overline="From" headline={useAddressLabel(f.from)} />
        )}
        {account !== f.to && (
          <ListItem leading={f.to} overline="To" headline={useAddressLabel(f.to)} />
        )}
        <ListItem leading={f.token} overline="Amount" headline={useFormattedTokenAmount(f)} />
      </>
    ))
    .with({ __typename: 'TransferApprovalOp' }, (f) => (
      <>
        <ListItem leading={f.spender} overline="Spender" headline={useAddressLabel(f.spender)} />
        <ListItem leading={f.token} overline="Amount" headline={useFormattedTokenAmount(f)} />
      </>
    ))
    .with({ __typename: 'SwapOp' }, (f) => (
      <>
        <ListItem
          leading={f.fromToken}
          overline="From"
          headline={useFormattedTokenAmount({ token: f.fromToken, amount: f.fromAmount })}
        />
        <ListItem
          leading={f.toToken}
          overline="To (minimum)"
          headline={useFormattedTokenAmount({
            token: f.toToken,
            amount: f.minimumToAmount,
          })}
        />
        <ListItem
          leading={ClockOutlineIcon}
          leadingSize="medium"
          overline="Deadline"
          headline={useTimestamp({ timestamp: DateTime.fromISO(f.deadline) })}
        />
      </>
    ))
    .otherwise(() => (
      <>
        <ListItem
          leading={op.to}
          overline={op.data ? 'Contract' : 'To'}
          headline={useAddressLabel(op.to)}
        />
      </>
    ));
}
