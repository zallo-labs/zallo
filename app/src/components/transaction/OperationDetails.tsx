import { ClockOutlineIcon } from '@theme/icons';
import { UAddress, asChain, asUAddress } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { AddressLabel } from '#/address/AddressLabel';
import { useTimestamp } from '#/format/Timestamp';
import { ListItem } from '#/list/ListItem';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { Chain } from 'chains';
import { LazyTokenIcon } from '#/token/LazyTokenIcon';
import { useLazyTokenAmount } from '#/token/useLazyTokenAmount';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import {
  OperationDetails_operation$data,
  OperationDetails_operation$key,
} from '~/api/__generated__/OperationDetails_operation.graphql';

const Operation = graphql`
  fragment OperationDetails_operation on Operation {
    to
    data
    function {
      __typename
      ... on GenericOp {
        _name
        _args
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
        to
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
`;

export interface OperationDetailsProps {
  account: UAddress;
  operation: OperationDetails_operation$key;
}

export function OperationDetails({ account, ...props }: OperationDetailsProps) {
  const op = useFragment(Operation, props.operation);
  const chain = asChain(account);

  return match(op.function)
    .with({ __typename: 'TransferOp' }, (f) => <TransferOp f={f} chain={chain} />)
    .with({ __typename: 'TransferFromOp' }, (f) => (
      <TransferFromOp f={f} chain={chain} account={account} />
    ))
    .with({ __typename: 'TransferApprovalOp' }, (f) => <TransferApprovalOp f={f} chain={chain} />)
    .with({ __typename: 'SwapOp' }, (f) => <SwapOp f={f} chain={chain} />)
    .otherwise(() => <Other op={op} chain={chain} />);
}

interface PropsFor<
  Typename extends NonNullable<OperationDetails_operation$data['function']>['__typename'],
> {
  f: Extract<NonNullable<OperationDetails_operation$data['function']>, { __typename: Typename }>;
  chain: Chain;
}

function TransferOp({ f, chain }: PropsFor<'TransferOp'>) {
  return (
    <>
      <ListItem
        leading={<AddressIcon address={f.to} />}
        overline="To"
        headline={<AddressLabel address={asUAddress(f.to, chain)} />}
      />
      <ListItem
        leading={<LazyTokenIcon token={asUAddress(f.token, chain)} />}
        overline="Amount"
        headline={useLazyTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
      />
    </>
  );
}

interface TransferFromOpProps extends PropsFor<'TransferFromOp'> {
  account: UAddress;
}

function TransferFromOp({ f, chain, account }: TransferFromOpProps) {
  return (
    <>
      <ListItem
        leading={<LazyTokenIcon token={asUAddress(f.token, chain)} />}
        headline={useLazyTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
      />
      {account !== asUAddress(f.from, chain) && (
        <ListItem
          leading={<AddressIcon address={f.from} />}
          overline="From"
          headline={<AddressLabel address={asUAddress(f.from, chain)} />}
        />
      )}
      {account !== asUAddress(f.to, chain) && (
        <ListItem
          leading={<AddressIcon address={f.to} />}
          overline="To"
          headline={<AddressLabel address={asUAddress(f.to, chain)} />}
        />
      )}
      <ListItem
        leading={<LazyTokenIcon token={asUAddress(f.token, chain)} />}
        overline="Amount"
        headline={useLazyTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
      />
    </>
  );
}

function TransferApprovalOp({ f, chain }: PropsFor<'TransferApprovalOp'>) {
  return (
    <>
      <ListItem
        leading={<AddressIcon address={f.to} />}
        overline="Spender"
        headline={<AddressLabel address={asUAddress(f.to, chain)} />}
      />
      <ListItem
        leading={<LazyTokenIcon token={asUAddress(f.token, chain)} />}
        overline="Amount"
        headline={useLazyTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
      />
    </>
  );
}

function SwapOp({ f, chain }: PropsFor<'SwapOp'>) {
  return (
    <>
      <ListItem
        leading={<LazyTokenIcon token={asUAddress(f.fromToken, chain)} />}
        overline="From"
        headline={useLazyTokenAmount({
          token: asUAddress(f.fromToken, chain),
          amount: f.fromAmount,
        })}
      />
      <ListItem
        leading={<LazyTokenIcon token={asUAddress(f.toToken, chain)} />}
        overline="To (minimum)"
        headline={useLazyTokenAmount({
          token: asUAddress(f.toToken, chain),
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
  );
}

interface OtherProps {
  op: OperationDetails_operation$data;
  chain: Chain;
}

function Other({ op, chain }: OtherProps) {
  return (
    <ListItem
      leading={<AddressIcon address={op.to} />}
      overline={op.data ? 'Contract' : 'To'}
      headline={<AddressLabel address={asUAddress(op.to, chain)} />}
    />
  );
}
