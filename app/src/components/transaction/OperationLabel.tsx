import { match, P } from 'ts-pattern';
import { useAddressLabel } from '../address/AddressLabel';
import { Chain } from 'chains';
import { asUAddress } from 'lib';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { OperationLabel_PolicyQuery } from '~/api/__generated__/OperationLabel_PolicyQuery.graphql';
import {
  OperationLabel_operation$data,
  OperationLabel_operation$key,
} from '~/api/__generated__/OperationLabel_operation.graphql';
import { useLazyTokenAmount } from '#/token/useLazyTokenAmount';
import { useLazyQuery } from '~/api';

const Operation = graphql`
  fragment OperationLabel_operation on Operation {
    to
    function {
      __typename
      ... on GenericOp {
        _name
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
        toToken
      }
    }
  }
`;

const PolicyQuery = graphql`
  query OperationLabel_PolicyQuery($input: UniquePolicyInput!) {
    policy(input: $input) {
      id
      name
    }
  }
`;

export interface OperationLabelProps {
  operation: OperationLabel_operation$key;
  chain: Chain;
}

export function OperationLabel({ chain, ...props }: OperationLabelProps) {
  const op = useFragment(Operation, props.operation);

  return match(op.function)
    .with({ __typename: 'UpdatePolicyOp' }, (f) => <UpdatePolicyOp f={f} chain={chain} />)
    .with({ __typename: 'RemovePolicyOp' }, (f) => <RemovePolicyOp f={f} chain={chain} />)
    .with({ __typename: 'TransferOp' }, (f) => <TransferOp f={f} chain={chain} />)
    .with({ __typename: 'TransferFromOp' }, (f) => <TransferFromOp f={f} chain={chain} />)
    .with({ __typename: 'TransferApprovalOp' }, (f) => <TransferApprovalOp f={f} chain={chain} />)
    .with({ __typename: 'SwapOp' }, (f) => <SwapOp f={f} chain={chain} />)
    .with({ __typename: 'GenericOp' }, (f) => <GenericOp f={f} chain={chain} op={op} />)
    .with(P.nullish, () => <CallOp op={op} chain={chain} />)
    .otherwise(() => {
      throw new Error(`Unknown operation: ${op.function?.__typename}`);
    });
}

interface PropsFor<
  Typename extends NonNullable<OperationLabel_operation$data['function']>['__typename'],
> {
  f: Extract<NonNullable<OperationLabel_operation$data['function']>, { __typename: Typename }>;
  chain: Chain;
}

function UpdatePolicyOp({ f, chain }: PropsFor<'UpdatePolicyOp'>) {
  return `Update policy: ${
    useLazyQuery<OperationLabel_PolicyQuery>(PolicyQuery, {
      input: { account: asUAddress(f.account, chain), key: f.key },
    }).policy?.name
  }`;
}

function RemovePolicyOp({ f, chain }: PropsFor<'RemovePolicyOp'>) {
  return `Remove policy: ${
    useLazyQuery<OperationLabel_PolicyQuery>(PolicyQuery, {
      input: { account: asUAddress(f.account, chain), key: f.key },
    }).policy?.name
  }`;
}

function TransferOp({ f, chain }: PropsFor<'TransferOp'>) {
  return `Send ${useLazyTokenAmount({
    ...f,
    token: asUAddress(f.token, chain),
  })} to ${useAddressLabel(asUAddress(f.to, chain))}`;
}

function TransferFromOp({ f, chain }: PropsFor<'TransferFromOp'>) {
  return `Send ${useAddressLabel(asUAddress(f.token, chain))} from ${useAddressLabel(
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
  op: OperationLabel_operation$data;
}

function GenericOp({ f, chain, op }: GenericOpProps) {
  return `${f._name} on ${useAddressLabel(asUAddress(op.to, chain))}`;
}

interface CallOpProps {
  op: OperationLabel_operation$data;
  chain: Chain;
}

function CallOp({ op, chain }: CallOpProps) {
  return `Call ${useAddressLabel(asUAddress(op.to, chain))}`;
}
