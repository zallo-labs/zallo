import { FragmentType, gql, useFragment } from '@api/generated';
import { ClockOutlineIcon } from '@theme/icons';
import { UAddress, asChain, asUAddress } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { useAddressLabel } from '#/address/AddressLabel';
import { useTimestamp } from '#/format/Timestamp';
import { ListItem } from '#/list/ListItem';
import { useFormattedTokenAmount } from '#/token/TokenAmount';
import { TokenIcon } from '#/token/TokenIcon';

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

// FIXME: terrible abuse of hoooks...
/* eslint-disable react-hooks/rules-of-hooks */
export function OperationDetails({ account, ...props }: OperationDetailsProps) {
  const op = useFragment(FragmentDoc, props.operation);
  const chain = asChain(account);

  return match(op.function)
    .with({ __typename: 'TransferOp' }, (f) => (
      <>
        <ListItem
          leading={f.to}
          overline="To"
          headline={useAddressLabel(asUAddress(f.to, chain))}
        />
        <ListItem
          leading={<TokenIcon token={asUAddress(f.token, chain)} />}
          overline="Amount"
          headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
        />
      </>
    ))
    .with({ __typename: 'TransferFromOp' }, (f) => (
      <>
        <ListItem
          leading={<TokenIcon token={asUAddress(f.token, chain)} />}
          headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
        />
        {account !== asUAddress(f.from, chain) && (
          <ListItem
            leading={f.from}
            overline="From"
            headline={useAddressLabel(asUAddress(f.from, chain))}
          />
        )}
        {account !== asUAddress(f.to, chain) && (
          <ListItem
            leading={f.to}
            overline="To"
            headline={useAddressLabel(asUAddress(f.to, chain))}
          />
        )}
        <ListItem
          leading={<TokenIcon token={asUAddress(f.token, chain)} />}
          overline="Amount"
          headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
        />
      </>
    ))
    .with({ __typename: 'TransferApprovalOp' }, (f) => (
      <>
        <ListItem
          leading={f.spender}
          overline="Spender"
          headline={useAddressLabel(asUAddress(f.spender, chain))}
        />
        <ListItem
          leading={<TokenIcon token={asUAddress(f.token, chain)} />}
          overline="Amount"
          headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
        />
      </>
    ))
    .with({ __typename: 'SwapOp' }, (f) => (
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
    ))
    .otherwise(() => (
      <>
        <ListItem
          leading={op.to}
          overline={op.data ? 'Contract' : 'To'}
          headline={useAddressLabel(asUAddress(op.to, chain))}
        />
      </>
    ));
}
/* eslint-enable react-hooks/rules-of-hooks */
