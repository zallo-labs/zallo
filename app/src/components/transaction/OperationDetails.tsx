import { FragmentType, gql, useFragment } from '@api/generated';
import { ClockOutlineIcon } from '@theme/icons';
import { UAddress, asChain, asUAddress } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { useTimestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { TokenIcon } from '~/components/token/TokenIcon';

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
          leading={(props) => <TokenIcon {...props} token={asUAddress(f.token, chain)} />}
          leadingSize="medium"
          overline="Amount"
          headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
        />
      </>
    ))
    .with({ __typename: 'TransferFromOp' }, (f) => (
      <>
        <ListItem
          leading={(props) => <TokenIcon {...props} token={asUAddress(f.token, chain)} />}
          leadingSize="medium"
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
          leading={(props) => <TokenIcon {...props} token={asUAddress(f.token, chain)} />}
          leadingSize="medium"
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
          leading={(props) => <TokenIcon {...props} token={asUAddress(f.token, chain)} />}
          leadingSize="medium"
          overline="Amount"
          headline={useFormattedTokenAmount({ ...f, token: asUAddress(f.token, chain) })}
        />
      </>
    ))
    .with({ __typename: 'SwapOp' }, (f) => (
      <>
        <ListItem
          leading={(props) => <TokenIcon {...props} token={asUAddress(f.fromToken, chain)} />}
          leadingSize="medium"
          overline="From"
          headline={useFormattedTokenAmount({
            token: asUAddress(f.fromToken, chain),
            amount: f.fromAmount,
          })}
        />
        <ListItem
          leading={(props) => <TokenIcon {...props} token={asUAddress(f.toToken, chain)} />}
          leadingSize="medium"
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
