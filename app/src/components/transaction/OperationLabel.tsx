import { match, P } from 'ts-pattern';

import { Chain } from 'chains';
import { asUAddress } from 'lib';
import { useQuery } from '~/gql';
import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { useAddressLabel } from '../address/AddressLabel';
import { useFormattedTokenAmount } from '../token/TokenAmount';

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
  chain: Chain;
}

// FIXME: terrible abuse of hoooks...
/* eslint-disable react-hooks/rules-of-hooks */
export function OperationLabel({ chain, ...props }: OperationLabelProps) {
  const op = useFragment(FragmentDoc, props.operation);

  return match(op.function)
    .with(
      { __typename: 'UpdatePolicyOp' },
      (f) =>
        `Update policy: ${useQuery(PolicyQuery, {
          input: { account: asUAddress(f.account, chain), key: f.key },
        }).data.policy?.name}`,
    )
    .with(
      { __typename: 'RemovePolicyOp' },
      (f) =>
        `Remove policy: ${useQuery(PolicyQuery, {
          input: { account: asUAddress(f.account, chain), key: f.key },
        }).data.policy?.name}`,
    )
    .with(
      { __typename: 'TransferOp' },
      (f) =>
        `Transfer ${useFormattedTokenAmount({
          ...f,
          token: asUAddress(f.token, chain),
        })} to ${useAddressLabel(asUAddress(f.to, chain))}`,
    )
    .with(
      { __typename: 'TransferFromOp' },
      (f) =>
        `Transfer ${useAddressLabel(asUAddress(f.token, chain))} from ${useAddressLabel(
          asUAddress(f.from, chain),
        )}`,
    )
    .with(
      { __typename: 'TransferApprovalOp' },
      (f) =>
        `Allow ${useAddressLabel(asUAddress(f.spender, chain))} to spend ${useAddressLabel(
          asUAddress(f.token, chain),
        )}`,
    )
    .with(
      { __typename: 'SwapOp' },
      (f) =>
        `Swap ${useAddressLabel(asUAddress(f.fromToken, chain))} for ${useAddressLabel(
          asUAddress(f.toToken, chain),
        )}`,
    )
    .with(
      { __typename: 'GenericOp' },
      (f) => `Call ${f._name} on ${useAddressLabel(asUAddress(op.to, chain))}`,
    )
    .with(P.nullish, () => `Call ${useAddressLabel(asUAddress(op.to, chain))}`)
    .exhaustive();
}

/* eslint-enable react-hooks/rules-of-hooks */
