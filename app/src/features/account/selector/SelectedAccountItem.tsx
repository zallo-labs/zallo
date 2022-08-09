import { TextField } from '@components/fields/TextField';
import { useState } from 'react';
import { IconButton, TextInput, useTheme } from 'react-native-paper';
import { useUpsertAccount } from '~/mutations/useUpsertAccount.api';
import { AccountItem, AccountItemProps } from './AccountItem';

export interface SelectedAccountItemProps extends AccountItemProps {}

export const SelectedAccountItem = ({
  account,
  ...itemProps
}: SelectedAccountItemProps) => {
  const { colors, iconSize } = useTheme();
  const upsertAccount = useUpsertAccount();

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(account.name ?? '');

  const submit = () => {
    if (name !== account.name) upsertAccount({ ...account, name });
    setEdit(false);
  };

  return (
    <AccountItem
      {...itemProps}
      account={account}
      selected
      {...(edit
        ? {
            Main: (
              <TextField
                mode="flat"
                noBackground
                dense
                placeholder="Account name..."
                value={name}
                onChangeText={setName}
                right={<TextInput.Icon name="check" onPress={submit} />}
              />
            ),
            mainContainer: { marginRight: 2 },
          }
        : {
            Right: (
              <IconButton
                icon="pencil"
                size={iconSize.small}
                color={colors.onSurface}
                onPress={() => setEdit(true)}
              />
            ),
          })}
    />
  );
};
