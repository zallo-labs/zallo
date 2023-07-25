import { gql } from '@api/gen';
import { useApproverAddress } from '@network/useApprover';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useMutation } from 'urql';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { showError } from '~/provider/SnackbarProvider';

const Query = gql(/* GraphQL */ `
  query CreateAccountScreen {
    accounts {
      id
      address
    }
  }
`);

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

export interface CreateAccountScreenParams {
  isOnboarding?: boolean;
}

export type CreateAccountScreenProps = StackNavigatorScreenProps<'CreateAccount'>;

export const CreateAccountScreen = withSuspense(
  ({ route, navigation: { replace } }: CreateAccountScreenProps) => {
    const { isOnboarding } = route.params;
    const approver = useApproverAddress();

    const { accounts } = useQuery(Query).data;
    const create = useMutation(Create)[1];

    const { control, handleSubmit } = useForm<Inputs>();

    useEffect(() => {
      if (isOnboarding && accounts.length) replace('Home', { account: accounts[0].address });
    }, [accounts, isOnboarding, replace]);

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
              try {
                const account = (
                  await create({
                    input: {
                      name,
                      policies: [{ name: 'High risk', approvers: [approver] }],
                    },
                  })
                ).data?.createAccount;

                if (account) replace('Home', { account: account.address });
              } catch (error) {
                showError('Failed to create account', { event: { error } });
              }
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
