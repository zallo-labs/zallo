import { match, P } from 'ts-pattern';
import { useAddressLabel } from '../address/AddressLabel';
import { useFormattedTokenAmount } from '../token/TokenAmount';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useQuery } from '~/gql';
import { Chain } from 'chains';
import { asUAddress } from 'lib';
import { OperationLabel_OperationFragmentFragment } from '@api/generated/graphql';

const FragmentDoc = gql(/* GraphQL */ `
  fragment OperationLabel_OperationFragment on Operation {
    to
    function {
      __typename
      ... on GenericOp {
        _name
        _args
      }
      ... on UpdatePolicyOp {
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
`);

const PolicyQuery = gql(/* GraphQL */ `
  query OperationLabel_Policy($input: UniquePolicyInput!) {
    policy(input: $input) {
      id
      name
    }
  }
`);

export interface OperationLabelProps {
  operation: FragmentType<typeof FragmentDoc>;
  chain: Chain;
}

export function OperationLabel({ chain, ...props }: OperationLabelProps) {
  const op = useFragment(FragmentDoc, props.operation);

  return match(op.function)
    .with({ __typename: 'UpdatePolicyOp' }, (f) => <UpdatePolicyOp f={f} chain={chain} />)
    .with({ __typename: 'RemovePolicyOp' }, (f) => <RemovePolicyOp f={f} chain={chain} />)
    .with({ __typename: 'TransferOp' }, (f) => <TransferOp f={f} chain={chain} />)
    .with({ __typename: 'TransferFromOp' }, (f) => <TransferFromOp f={f} chain={chain} />)
    .with({ __typename: 'TransferApprovalOp' }, (f) => <TransferApprovalOp f={f} chain={chain} />)
    .with({ __typename: 'SwapOp' }, (f) => <SwapOp f={f} chain={chain} />)
    .with({ __typename: 'GenericOp' }, (f) => <GenericOp f={f} chain={chain} op={op} />)
    .with(P.nullish, () => <CallOp op={op} chain={chain} />)
    .exhaustive();
}

interface PropsFor<
  Typename extends NonNullable<OperationLabel_OperationFragmentFragment['function']>['__typename'],
> {
  f: Extract<
    NonNullable<OperationLabel_OperationFragmentFragment['function']>,
    { __typename: Typename }
  >;
  chain: Chain;
}

function UpdatePolicyOp({ f, chain }: PropsFor<'UpdatePolicyOp'>) {
  return `Update policy: ${
    useQuery(PolicyQuery, {
      input: { account: asUAddress(f.account, chain), key: f.key },
    }).data.policy?.name
  }`;
}

function RemovePolicyOp({ f, chain }: PropsFor<'RemovePolicyOp'>) {
  return `Remove policy: ${
    useQuery(PolicyQuery, {
      input: { account: asUAddress(f.account, chain), key: f.key },
    }).data.policy?.name
  }`;
}

function TransferOp({ f, chain }: PropsFor<'TransferOp'>) {
  return `Transfer ${useFormattedTokenAmount({
    ...f,
    token: asUAddress(f.token, chain),
  })} to ${useAddressLabel(asUAddress(f.to, chain))}`;
}

function TransferFromOp({ f, chain }: PropsFor<'TransferFromOp'>) {
  return `Transfer ${useAddressLabel(asUAddress(f.token, chain))} from ${useAddressLabel(
    asUAddress(f.from, chain),
  )}`;
}

function TransferApprovalOp({ f, chain }: PropsFor<'TransferApprovalOp'>) {
  return `Allow ${useAddressLabel(asUAddress(f.to, chain))} to spend ${useAddressLabel(
    asUAddress(f.token, chain),
  )}`;
}

function SwapOp({ f, chain }: PropsFor<'SwapOp'>) {
  return `Swap ${useAddressLabel(asUAddress(f.fromToken, chain))} for ${useAddressLabel(
    asUAddress(f.toToken, chain),
  )}`;
}

interface GenericOpProps extends PropsFor<'GenericOp'> {
  op: OperationLabel_OperationFragmentFragment;
}

function GenericOp({ f, chain, op }: GenericOpProps) {
  return `Call ${f._name} on ${useAddressLabel(asUAddress(op.to, chain))}`;
}

interface CallOpProps {
  op: OperationLabel_OperationFragmentFragment;
  chain: Chain;
}

function CallOp({ op, chain }: CallOpProps) {
  return `Call ${useAddressLabel(asUAddress(op.to, chain))}`;
}
