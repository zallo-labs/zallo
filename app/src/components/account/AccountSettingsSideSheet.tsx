import { FragmentType, gql, useFragment } from '@api/generated';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useMutation } from 'urql';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { Actions } from '#/layout/Actions';
import { AccountNameFormField } from '#/fields/AccountNameFormField';
import { SideSheet } from '../SideSheet/SideSheet';

const Account = gql(/* GraphQL */ `
  fragment AccountSettingsSideSheet_Account on Account {
    id
    address
    label
  }
`);

const Update = gql(/* GraphQL */ `
  mutation AccountSettingsSideSheet_Update($account: UAddress!, $label: String!) {
    updateAccount(input: { account: $account, label: $label }) {
      id
      label
      name
    }
  }
`);

interface Inputs {
  label: string;
}

export interface AccountSettingsSideSheetProps {
  account: FragmentType<typeof Account>;
}

export function AccountSettingsSideSheet(props: AccountSettingsSideSheetProps) {
  const account = useFragment(Account, props.account);
  const update = useMutation(Update)[1];

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { label: account?.label },
  });

  return (
    <SideSheet headline="Details">
      <View style={styles.fields}>
        <AccountNameFormField name="label" control={control} required />
      </View>

      <Actions>
        <FormSubmitButton
          mode="contained"
          requireChanges
          control={control}
          onPress={handleSubmit(async (input) => {
            await update({ account: account.address, label: input.label });
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
