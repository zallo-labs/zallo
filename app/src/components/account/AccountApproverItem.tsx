import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { FragmentType, gql, useFragment } from '@api';
import { NavigateNextIcon } from '@theme/icons';
import { Link } from 'expo-router';
import { UAddress } from 'lib';
import { truncateAddr } from '~/util/format';

const Approver = gql(/* GraphQL */ `
  fragment AccountApproverItem_Approver on Approver {
    address
    label
  }
`);

export interface AccountApproverItemProps extends Partial<ListItemProps> {
  account: UAddress;
  approver: FragmentType<typeof Approver>;
}

export function AccountApproverItem(props: AccountApproverItemProps) {
  const a = useFragment(Approver, props.approver);

  return (
    <Link
      href={{
        pathname: '/(drawer)/[account]/settings/approver/[address]',
        params: { account: props.account, address: a.address },
      }}
      asChild
    >
      <ListItem
        leading={<AddressIcon address={a.address} />}
        headline={a.label || truncateAddr(a.address)}
        lines={2}
        trailing={NavigateNextIcon}
        {...props}
      />
    </Link>
  );
}
