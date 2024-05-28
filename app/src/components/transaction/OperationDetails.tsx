import { FragmentType, gql, useFragment } from '@api/generated';
import { ClockOutlineIcon } from '@theme/icons';
import { UAddress, asChain, asUAddress } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { AddressLabel, useAddressLabel } from '#/address/AddressLabel';
import { useTimestamp } from '#/format/Timestamp';
import { ListItem } from '#/list/ListItem';
import { useFormattedTokenAmount } from '#/token/TokenAmount';
import { TokenIcon } from '#/token/TokenIcon';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { OperationDetails_OperationFragment } from '@api/generated/graphql';
import { Chain } from 'chains';

const FragmentDoc = gql(/* GraphQL */ `
  fragment OperationDetails_Operation on Operation {
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
  account: UAddress;
  operation: FragmentType<typeof FragmentDoc>;
}

export function OperationDetails({ account, ...props }: OperationDetailsProps) {
  const op = useFragment(FragmentDoc, props.operation);
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
  Typename extends NonNullable<OperationDetails_OperationFragment['function']>['__typename'],
> {
  f: Extract<NonNullable<OperationDetails_OperationFragment['function']>, { __typename: Typename }>;
  chain: Chain;
}

function TransferOp({ f, chain }: PropsFor<'TransferOp'>) {
  return (
    <>
      <ListItem
        leading={<AddressIcon address={f.to} />}
        overline="To"
        headline={useAddressLabel(asUAddress(f.to, chain))}
      />
      <ListItem
        leading={<TokenIcon token={asUAddress(f.token, chain)} />}
        overline="Amount"
        headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
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
        leading={<TokenIcon token={asUAddress(f.token, chain)} />}
        headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
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
        leading={<TokenIcon token={asUAddress(f.token, chain)} />}
        overline="Amount"
        headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
      />
    </>
  );
}

function TransferApprovalOp({ f, chain }: PropsFor<'TransferApprovalOp'>) {
  return (
    <>
      <ListItem
        leading={<AddressIcon address={f.spender} />}
        overline="Spender"
        headline={useAddressLabel(asUAddress(f.spender, chain))}
      />
      <ListItem
        leading={<TokenIcon token={asUAddress(f.token, chain)} />}
        overline="Amount"
        headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
      />
    </>
  );
}

function SwapOp({ f, chain }: PropsFor<'SwapOp'>) {
  return (
    <>
      <ListItem
        leading={<TokenIcon token={asUAddress(f.fromToken, chain)} />}
        overline="From"
        headline={useFormattedTokenAmount({
          token: asUAddress(f.fromToken, chain),
          amount: f.fromAmount,
        })}
      />
      <ListItem
        leading={<TokenIcon token={asUAddress(f.toToken, chain)} />}
        overline="To (minimum)"
        headline={useFormattedTokenAmount({
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
  op: OperationDetails_OperationFragment;
  chain: Chain;
}

function Other({ op, chain }: OtherProps) {
  return (
    <ListItem
      leading={<AddressIcon address={op.to} />}
      overline={op.data ? 'Contract' : 'To'}
      headline={useAddressLabel(asUAddress(op.to, chain))}
    />
  );
}
