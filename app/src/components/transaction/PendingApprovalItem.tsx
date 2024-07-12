import { CheckIcon } from '@theme/icons';
import { ListItem } from '#/list/ListItem';
import { useApprove } from '~/hooks/useApprove';
import { IconButton } from '#/IconButton';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { PendingApprovalItem_user$key } from '~/api/__generated__/PendingApprovalItem_user.graphql';
import { PendingApprovalItem_approver$key } from '~/api/__generated__/PendingApprovalItem_approver.graphql';
import { PendingApprovalItem_proposal$key } from '~/api/__generated__/PendingApprovalItem_proposal.graphql';
import { truncateAddr } from '~/util/format';

const User = graphql`
  fragment PendingApprovalItem_user on User {
    ...useApprove_user
  }
`;

const Approver = graphql`
  fragment PendingApprovalItem_approver on Approver {
    id
    address
    label
  }
`;

const Proposal = graphql`
  fragment PendingApprovalItem_proposal on Proposal {
    account {
      id
      chain
    }
    ...useApprove_proposal
  }
`;

export interface PendingApprovalItemProps {
  user: PendingApprovalItem_user$key;
  approver: PendingApprovalItem_approver$key;
  proposal: PendingApprovalItem_proposal$key;
}

export function PendingApprovalItem(props: PendingApprovalItemProps) {
  const user = useFragment(User, props.user);
  const approver = useFragment(Approver, props.approver);
  const proposal = useFragment(Proposal, props.proposal);

  const approve = useApprove({ user, proposal, approver: approver.address });

  return (
    <ListItem
      leading={<AddressIcon address={approver.address} />}
      headline={approver.label || truncateAddr(approver.address)}
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
