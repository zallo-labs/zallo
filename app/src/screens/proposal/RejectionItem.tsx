import { FragmentType, gql, useFragment } from '@api';
import { CheckIcon } from '@theme/icons';
import { IconButton } from 'react-native-paper';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { useApprove } from '~/components/proposal/useApprove';

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
      headline={({ Text }) => (
        <Text>
          <AddressLabel address={approver.address} />
        </Text>
      )}
      supporting={({ Text }) => (
        <Text>
          <Timestamp timestamp={createdAt} />
        </Text>
      )}
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
