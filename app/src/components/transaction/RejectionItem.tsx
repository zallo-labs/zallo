import { FragmentType, gql, useFragment } from '@api';
import { CheckIcon } from '@theme/icons';
import { asUAddress } from 'lib';
import { IconButton } from '#/IconButton';
import { AddressLabel } from '#/address/AddressLabel';
import { Timestamp } from '#/format/Timestamp';
import { ListItem } from '#/list/ListItem';
import { useApprove } from '~/hooks/useApprove';

const User = gql(/* GraphQL */ `
  fragment RejectionItem_User on User {
    ...UseApprove_User
  }
`);

const Rejection = gql(/* GraphQL */ `
  fragment RejectionItem_Rejection on Rejection {
    id
    createdAt
    approver {
      id
      address
    }
  }
`);

const Proposal = gql(/* GraphQL */ `
  fragment RejectionItem_Proposal on Proposal {
    account {
      id
      chain
    }
    ...UseApprove_Proposal
  }
`);

export interface RejectionItemProps {
  user: FragmentType<typeof User>;
  rejection: FragmentType<typeof Rejection>;
  proposal: FragmentType<typeof Proposal>;
}

export function RejectionItem(props: RejectionItemProps) {
  const user = useFragment(User, props.user);
  const { approver, createdAt } = useFragment(Rejection, props.rejection);
  const proposal = useFragment(Proposal, props.proposal);

  const approve = useApprove({ user, proposal, approver: approver.address });

  return (
    <ListItem
      leading={approver.address}
      headline={<AddressLabel address={asUAddress(approver.address, proposal.account.chain)} />}
      supporting={<Timestamp timestamp={createdAt} />}
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
