import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { FragmentType, gql, useFragment } from '@api';
import { truncateAddr } from '~/util/format';

const Approver = gql(/* GraphQL */ `
  fragment AccountApproverItem_Approver on Approver {
    address
    label
  }
`);

export interface AccountApproverItemProps extends Partial<ListItemProps> {
  approver: FragmentType<typeof Approver>;
}

export function AccountApproverItem(props: AccountApproverItemProps) {
  const a = useFragment(Approver, props.approver);

  return (
    <ListItem
      leading={<AddressIcon address={a.address} />}
      headline={a.label || truncateAddr(a.address)}
      lines={2}
      {...props}
    />
  );
}
