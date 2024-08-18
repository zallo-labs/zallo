import { CheckIcon } from '@theme/icons';
import { asUAddress } from 'lib';
import { IconButton } from '#/IconButton';
import { AddressLabel } from '#/address/AddressLabel';
import { Timestamp } from '#/format/Timestamp';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { useApprove } from '~/hooks/useApprove';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { RejectionItem_user$key } from '~/api/__generated__/RejectionItem_user.graphql';
import { RejectionItem_rejection$key } from '~/api/__generated__/RejectionItem_rejection.graphql';
import { RejectionItem_proposal$key } from '~/api/__generated__/RejectionItem_proposal.graphql';

const User = graphql`
  fragment RejectionItem_user on User {
    ...useApprove_user
  }
`;

const Rejection = graphql`
  fragment RejectionItem_rejection on Rejection {
    id
    createdAt
    approver {
      id
      address
    }
  }
`;

const Proposal = graphql`
  fragment RejectionItem_proposal on Proposal {
    account {
      id
      chain
    }
    ...useApprove_proposal
  }
`;

export interface RejectionItemProps extends Partial<ListItemProps> {
  user: RejectionItem_user$key;
  rejection: RejectionItem_rejection$key;
  proposal: RejectionItem_proposal$key;
}

export function RejectionItem(props: RejectionItemProps) {
  const user = useFragment(User, props.user);
  const { approver, createdAt } = useFragment(Rejection, props.rejection);
  const proposal = useFragment(Proposal, props.proposal);

  const approve = useApprove({ user, proposal, approver: approver.address });

  return (
    <ListItem
      leading={<AddressIcon address={approver.address} />}
      headline={<AddressLabel address={asUAddress(approver.address, proposal.account.chain)} />}
      supporting={<Timestamp timestamp={createdAt} />}
      {...(approve && {
        trailing: ({ size }) => (
          <IconButton mode="contained-tonal" icon={CheckIcon} size={size} onPress={approve} />
        ),
      })}
      {...props}
    />
  );
}
