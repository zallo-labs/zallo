import { UndoIcon } from '@theme/icons';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { TextField } from '~/components/fields/TextField';
import { useSetAccountName } from '~/mutations/account/useSetAccountName.api';
import { CombinedAccount } from '~/queries/account/useAccount.api';

export interface NameFieldProps {
  account: CombinedAccount;
}

export const NameField = ({ account }: NameFieldProps) => {
  const setNameMutation = useSetAccountName(account);

  const [name, setName] = useState(account.name);
  const submitName = () => setNameMutation(name);
  const undoName = () => setName(account.name);

  return (
    <TextField
      label="Name"
      value={name}
      onChangeText={setName}
      onSubmitEditing={submitName}
      onBlur={submitName}
      {...(name !== account.name && {
        right: <TextInput.Icon icon={UndoIcon} onPress={undoName} />,
      })}
    />
  );
};
