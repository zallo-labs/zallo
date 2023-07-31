import { match, P } from 'ts-pattern';
import { useAddressLabel } from '../address/AddressLabel';
import { useFormattedTokenAmount } from '../token/TokenAmount';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useQuery } from '~/gql';

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
}

export function OperationLabel(props: OperationLabelProps) {
  const op = useFragment(FragmentDoc, props.operation);

  return match(op.function)
    .with(
      { __typename: 'UpdatePolicyOp' },
      (f) =>
        `Update policy: ${
          useQuery(PolicyQuery, { input: { account: f.account, key: f.key } }).data.policy?.name
        }`,
    )
    .with(
      { __typename: 'RemovePolicyOp' },
      (f) =>
        `Remove policy: ${
          useQuery(PolicyQuery, { input: { account: f.account, key: f.key } }).data.policy?.name
        }`,
    )
    .with(
      { __typename: 'TransferOp' },
      (f) => `Transfer ${useFormattedTokenAmount(f)} to ${useAddressLabel(f.to)}`,
    )
    .with(
      { __typename: 'TransferFromOp' },
      (f) => `Transfer ${useAddressLabel(f.token)} from ${useAddressLabel(f.from)}`,
    )
    .with(
      { __typename: 'TransferApprovalOp' },
      (f) => `Allow ${useAddressLabel(f.spender)} to spend ${useAddressLabel(f.token)}`,
    )
    .with(
      { __typename: 'SwapOp' },
      (f) => `Swap ${useAddressLabel(f.fromToken)} for ${useAddressLabel(f.toToken)}`,
    )
    .with({ __typename: 'GenericOp' }, (f) => `Call ${f._name} on ${useAddressLabel(op.to)}`)
    .with(P.nullish, () => `Call ${useAddressLabel(op.to)}`)
    .exhaustive();
}
