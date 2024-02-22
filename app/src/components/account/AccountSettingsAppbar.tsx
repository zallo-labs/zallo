import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { useSideSheet } from '#/SideSheet/SideSheetLayout';
import { FragmentType, gql, useFragment } from '@api';
import { EditIcon } from '@theme/icons';

const Account = gql(/* GraphQL */ `
  fragment AccountSettingsAppbar_Account on Account {
    id
    name
  }
`);

export interface AccountSettingsAppbarProps {
  account: FragmentType<typeof Account>;
}

export function AccountSettingsAppbar(props: AccountSettingsAppbarProps) {
  const account = useFragment(Account, props.account);
  const sheet = useSideSheet();

  console.log(sheet.visible);

  return (
    <AppbarOptions
      mode="large"
      leading="menu"
      headline={account.name}
      {...(!sheet.visible && {
        trailing: (props) => <EditIcon {...props} onPress={() => sheet.show(true)} />,
      })}
    />
  );
}
