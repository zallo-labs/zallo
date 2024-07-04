import { CloseIcon } from '@theme/icons';
import { asUAddress } from 'lib';
import { IconButton } from '#/IconButton';
import { AddressLabel } from '#/address/AddressLabel';
import { Timestamp } from '#/format/Timestamp';
import { ListItem } from '#/list/ListItem';
import { useReject } from '~/hooks/useReject';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { graphql, useFragment } from 'react-relay';
import { ApprovalItem_user$key } from '~/api/__generated__/ApprovalItem_user.graphql';
import { ApprovalItem_approval$key } from '~/api/__generated__/ApprovalItem_approval.graphql';
import { ApprovalItem_proposal$key } from '~/api/__generated__/ApprovalItem_proposal.graphql';

const User = graphql`
  fragment ApprovalItem_user on User {
    ...useReject_user
  }
`;

const Approval = graphql`
  fragment ApprovalItem_approval on Approval {
    id
    createdAt
    approver {
      id
      address @required(action: THROW)
    }
  }
`;

const Proposal = graphql`
  fragment ApprovalItem_proposal on Proposal {
    account {
      id
      chain
    }
    ...useReject_proposal
  }
`;

export interface ApprovalItemProps {
  user: ApprovalItem_user$key;
  approval: ApprovalItem_approval$key;
  proposal: ApprovalItem_proposal$key;
}

export function ApprovalItem(props: ApprovalItemProps) {
  const user = useFragment(User, props.user);
  const { approver, createdAt } = useFragment(Approval, props.approval);
  const proposal = useFragment(Proposal, props.proposal);

  console.log({ ApprovalItem: { approver, proposal } });
  const reject = useReject({ user, proposal, approver: approver.address });

  return (
    <ListItem
      leading={<AddressIcon address={approver.address} />}
      headline={<AddressLabel address={asUAddress(approver.address, proposal.account.chain)} />}
      supporting={<Timestamp timestamp={createdAt} />}
      {...(reject && {
        trailing: ({ size, disabled }) => (
          <IconButton
            mode="contained-tonal"
            icon={CloseIcon}
            size={size}
            disabled={disabled}
            onPress={reject}
          />
        ),
      })}
    />
  );
}
