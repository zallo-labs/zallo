import { FragmentType, gql, useFragment } from '@api/generated';
import { useApproverAddress } from '@network/useApprover';
import { useRouter } from 'expo-router';
import { RadioButton } from 'react-native-paper';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { truncateAddr } from '~/util/format';

const UserApproverItem_UserApproverFragment = gql(/* GraphQL */ `
  fragment UserApproverItem_UserApproverFragment on UserApprover {
    id
    address
    name
    cloud {
      id
      provider
      subject
    }
  }
`);

export interface UserApproverItemProps extends Partial<ListItemProps> {
  approver: FragmentType<typeof UserApproverItem_UserApproverFragment>;
}

export function UserApproverItem(props: UserApproverItemProps) {
  const a = useFragment(UserApproverItem_UserApproverFragment, props.approver);
  const router = useRouter();
  const selected = useApproverAddress() === a.address;

  return (
    <ListItem
      leading={a.address}
      headline={a.name}
      supporting={truncateAddr(a.address)}
      {...(selected && {
        trailing: () => (
          <RadioButton.IOS value={a.address} status={selected ? 'checked' : 'unchecked'} />
        ),
      })}
      onPress={() =>
        router.push({ pathname: `/approver/[address]/`, params: { address: a.address } })
      }
      {...props}
    />
  );
}
