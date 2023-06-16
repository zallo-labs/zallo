import { ProposalOperation } from '@api/proposal';
import { ClockOutlineIcon } from '@theme/icons';
import { Address, asBigInt } from 'lib';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { useTimestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';

export interface OperationDetailsProps {
  account: Address;
  op: ProposalOperation;
}

export function OperationDetails({ account, op }: OperationDetailsProps) {
  return match(op.function)
    .with({ __typename: 'TransferOp' }, (f) => (
      <>
        <ListItem leading={f.to} overline="To" headline={useAddressLabel(f.to)} />
        <ListItem
          leading={f.token}
          overline="Amount"
          headline={useFormattedTokenAmount({ token: f.token, amount: asBigInt(f.amount) })}
        />
      </>
    ))
    .with({ __typename: 'TransferFromOp' }, (f) => (
      <>
        <ListItem
          leading={f.token}
          headline={useFormattedTokenAmount({ token: f.token, amount: asBigInt(f.amount) })}
        />
        {account !== f.from && (
          <ListItem leading={f.from} overline="From" headline={useAddressLabel(f.from)} />
        )}
        {account !== f.to && (
          <ListItem leading={f.to} overline="To" headline={useAddressLabel(f.to)} />
        )}
        <ListItem
          leading={f.token}
          overline="Amount"
          headline={useFormattedTokenAmount({ token: f.token, amount: asBigInt(f.amount) })}
        />
      </>
    ))
    .with({ __typename: 'TransferApprovalOp' }, (f) => (
      <>
        <ListItem leading={f.spender} overline="Spender" headline={useAddressLabel(f.spender)} />
        <ListItem
          leading={f.token}
          overline="Amount"
          headline={useFormattedTokenAmount({ token: f.token, amount: asBigInt(f.amount) })}
        />
      </>
    ))
    .with({ __typename: 'SwapOp' }, (f) => (
      <>
        <ListItem
          leading={f.fromToken}
          overline="From"
          headline={useFormattedTokenAmount({ token: f.fromToken, amount: asBigInt(f.fromAmount) })}
        />
        <ListItem
          leading={f.toToken}
          overline="To (minimum)"
          headline={useFormattedTokenAmount({
            token: f.toToken,
            amount: asBigInt(f.minimumToAmount),
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
    .otherwise((f) => (
      <>
        <ListItem
          leading={op.to}
          overline={op.data ? 'Contract' : 'To'}
          headline={useAddressLabel(op.to)}
        />
      </>
    ));
}
