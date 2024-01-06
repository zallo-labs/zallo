import { IconButton } from 'react-native-paper';

import { asUAddress } from 'lib';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { useReject } from '~/hooks/useReject';
import { CloseIcon } from '~/util/theme/icons';

const User = gql(/* GraphQL */ `
  fragment ApprovalItem_User on User {
    ...UseReject_User
  }
`);

const Approval = gql(/* GraphQL */ `
  fragment ApprovalItem_Approval on Approval {
    id
    createdAt
    approver {
      id
      address
    }
  }
`);

const Proposal = gql(/* GraphQL */ `
  fragment ApprovalItem_Proposal on Proposal {
    account {
      id
      chain
    }
    ...UseReject_Proposal
  }
`);

export interface ApprovalItemProps {
  user: FragmentType<typeof User>;
  approval: FragmentType<typeof Approval>;
  proposal: FragmentType<typeof Proposal>;
}

export function ApprovalItem(props: ApprovalItemProps) {
  const user = useFragment(User, props.user);
  const { approver, createdAt } = useFragment(Approval, props.approval);
  const proposal = useFragment(Proposal, props.proposal);

  const reject = useReject({ user, proposal, approver: approver.address });

  return (
    <ListItem
      leading={approver.address}
      headline={({ Text }) => (
        <Text>
          <AddressLabel address={asUAddress(approver.address, proposal.account.chain)} />
        </Text>
      )}
      supporting={({ Text }) => (
        <Text>
          <Timestamp timestamp={createdAt} />
        </Text>
      )}
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
