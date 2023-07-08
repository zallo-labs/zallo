import { gql } from '@api/gen';
import {
  CreateAccountAccountsDocument,
  CreateAccountAccountsQuery,
  CreateAccountAccountsQueryVariables,
  useCreateAccountMutation,
} from '@api/generated';
import { useSuspenseQuery } from '@apollo/client';
import { useApproverAddress } from '@network/useApprover';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { showError } from '~/provider/SnackbarProvider';

gql(/* GraphQL */ `
  query CreateAccountAccounts {
    accounts {
      id
      address
    }
  }

  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      address
    }
  }
`);

interface Inputs {
  name: string;
}

export interface CreateAccountScreenParams {
  isOnboarding?: boolean;
}

export type CreateAccountScreenProps = StackNavigatorScreenProps<'CreateAccount'>;

export const CreateAccountScreen = withSuspense(
  ({ route, navigation: { replace } }: CreateAccountScreenProps) => {
    const { isOnboarding } = route.params;
    const approver = useApproverAddress();

    const { accounts } = useSuspenseQuery<
      CreateAccountAccountsQuery,
      CreateAccountAccountsQueryVariables
    >(CreateAccountAccountsDocument).data;
    const [create] = useCreateAccountMutation();

    const { control, handleSubmit } = useForm<Inputs>();

    useEffect(() => {
      if (isOnboarding && accounts.length) replace('Home', { account: accounts[0].address });
    }, [isOnboarding && accounts.length]);

    return (
      <Screen>
        <Appbar mode="large" leading="back" headline="Account" />

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
              const account = (
                await create({
                  variables: {
                    input: {
                      name,
                      policies: [{ approvers: [approver] }],
                    },
                  },
                  onError: (error) => showError('Failed to create account', { event: { error } }),
                })
              ).data?.createAccount;

              if (account) replace('Home', { account: account.address });
            })}
          >
            Create account
          </FormSubmitButton>
        </Actions>
      </Screen>
    );
  },
  ScreenSkeleton,
);

const styles = StyleSheet.create({
  fields: {
    margin: 16,
    gap: 16,
  },
  button: {
    alignSelf: 'stretch',
  },
});
