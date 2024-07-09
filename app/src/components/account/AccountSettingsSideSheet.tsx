import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { Actions } from '#/layout/Actions';
import { AccountNameFormField } from '#/fields/AccountNameFormField';
import { SideSheet } from '../SideSheet/SideSheet';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { AccountSettingsSideSheet_account$key } from '~/api/__generated__/AccountSettingsSideSheet_account.graphql';
import { useMutation } from '~/api';
import { AccountSettingsSideSheetMutation } from '~/api/__generated__/AccountSettingsSideSheetMutation.graphql';

const Account = graphql`
  fragment AccountSettingsSideSheet_account on Account {
    id
    address
    name
  }
`;

const Update = graphql`
  mutation AccountSettingsSideSheetMutation($account: UAddress!, $name: String!) {
    updateAccount(input: { account: $account, name: $name }) {
      id
      name
    }
  }
`;

interface Inputs {
  name: string;
}

export interface AccountSettingsSideSheetProps {
  account: AccountSettingsSideSheet_account$key;
}

export function AccountSettingsSideSheet(props: AccountSettingsSideSheetProps) {
  const account = useFragment(Account, props.account);
  const update = useMutation<AccountSettingsSideSheetMutation>(Update);

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: account?.name },
  });

  return (
    <SideSheet headline="Details">
      <View style={styles.fields}>
        <AccountNameFormField name="name" control={control} required />
      </View>

      <Actions>
        <FormSubmitButton
          mode="contained"
          requireChanges
          control={control}
          onPress={handleSubmit(async (input) => {
            await update({ account: account.address, name: input.name });
            reset(input);
          })}
        >
          Update
        </FormSubmitButton>
      </Actions>
    </SideSheet>
  );
}

const styles = StyleSheet.create({
  fields: {
    margin: 16,
  },
});
