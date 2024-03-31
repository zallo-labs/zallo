import { FragmentType, gql, useFragment } from '@api';
import { CheckIcon } from '@theme/icons';
import { asUAddress } from 'lib';
import { AddressLabel } from '#/address/AddressLabel';
import { ListItem } from '#/list/ListItem';
import { useApprove } from '~/hooks/useApprove';
import { IconButton } from '#/IconButton';
import { AddressIcon } from '#/Identicon/AddressIcon';

const User = gql(/* GraphQL */ `
  fragment PendingApprovalItem_User on User {
    ...UseApprove_User
  }
`);

const Approver = gql(/* GraphQL */ `
  fragment PendingApprovalItem_Approver on Approver {
    id
    address
    label
  }
`);

const Proposal = gql(/* GraphQL */ `
  fragment PendingApprovalItem_Proposal on Proposal {
    account {
      id
      chain
    }
    ...UseApprove_Proposal
  }
`);

export interface PendingApprovalItemProps {
  user: FragmentType<typeof User>;
  approver: FragmentType<typeof Approver>;
  proposal: FragmentType<typeof Proposal>;
}

export function PendingApprovalItem(props: PendingApprovalItemProps) {
  const user = useFragment(User, props.user);
  const approver = useFragment(Approver, props.approver);
  const proposal = useFragment(Proposal, props.proposal);

  const approve = useApprove({ user, proposal, approver: approver.address });

  return (
    <ListItem
      leading={<AddressIcon address={approver.address} />}
      headline={
        approver.label || (
          <AddressLabel address={asUAddress(approver.address, proposal.account.chain)} />
        )
      }
      {...(approve && {
        trailing: ({ size, disabled }) => (
          <IconButton
            mode="contained-tonal"
            icon={CheckIcon}
            size={size}
            disabled={disabled}
            onPress={approve}
          />
        ),
      })}
    />
  );
}
