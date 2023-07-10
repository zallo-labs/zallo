import { FragmentType, gql, useFragment } from '@api/gen';
import { useApproverAddress } from '@network/useApprover';
import { useNavigation } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import { ListItem } from '~/components/list/ListItem';
import { truncateAddr } from '~/util/format';

const UserApproverItem_UserApproverFragment = gql(/* GraphQL */ `
  fragment UserApproverItem_UserApproverFragment on UserApprover {
    id
    address
    name
  }
`);

export interface UserApproverItemProps {
  approver: FragmentType<typeof UserApproverItem_UserApproverFragment>;
}

export function UserApproverItem(props: UserApproverItemProps) {
  const a = useFragment(UserApproverItem_UserApproverFragment, props.approver);
  const { navigate } = useNavigation();
  const selected = useApproverAddress() === a.address;

  return (
    <ListItem
      leading={a.address}
      headline={a.name}
      supporting={truncateAddr(a.address)}
      {...(selected && {
        trailing: () => (
          <RadioButton value={a.address} status={selected ? 'checked' : 'unchecked'} />
        ),
      })}
      onPress={() => navigate('Approver', {})}
    />
  );
}
