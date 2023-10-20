import { SearchParams, useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { useApproverAddress } from '@network/useApprover';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useMutation } from 'urql';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { showError } from '~/components/provider/SnackbarProvider';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';

const Create = gql(/* GraphQL */ `
  mutation CreateAccountScreen_Create($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      address
    }
  }
`);

interface Inputs {
  name: string;
}

export type CreateAccountScreenRoute = `/accounts/create`;
export type CreateAccountScreenParams = SearchParams<CreateAccountScreenRoute>;

export default function CreateAccountScreen() {
  const router = useRouter();
  const approver = useApproverAddress();
  const create = useMutation(Create)[1];

  const { control, handleSubmit } = useForm<Inputs>();

  return (
    <View style={styles.root}>
      <AppbarOptions mode="large" headline="Account" />

      <View style={styles.fields}>
        <FormTextField
          name="name"
          control={control}
          label="Name"
          placeholder="Personal"
          supporting="Only visible by account members"
          autoFocus
          rules={{ required: true }}
        />
      </View>

      <Actions>
        <FormSubmitButton
          mode="contained"
          style={styles.button}
          control={control}
          onPress={handleSubmit(async ({ name }) => {
            try {
              const account = (
                await create({
                  input: {
                    name,
                    policies: [{ name: 'High risk', approvers: [approver] }],
                  },
                })
              ).data?.createAccount;

              router.push({
                pathname: `/(drawer)/[account]/(home)/`,
                params: { account: account!.address },
              });
            } catch (error) {
              showError('Failed to create account', { event: { error } });
            }
          })}
        >
          Create account
        </FormSubmitButton>
      </Actions>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fields: {
    margin: 16,
    gap: 16,
  },
  button: {
    alignSelf: 'stretch',
  },
});
