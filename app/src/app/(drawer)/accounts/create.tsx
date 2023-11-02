import { useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { useApproverAddress } from '@network/useApprover';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { useMutation } from 'urql';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { Actions } from '~/components/layout/Actions';
import { showError } from '~/components/provider/SnackbarProvider';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { makeStyles } from '@theme/makeStyles';
import { AccountNameFormField } from '~/components/fields/AccountNameFormField';

const Create = gql(/* GraphQL */ `
  mutation CreateAccountScreen_Create($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      address
    }
  }
`);

interface Inputs {
  label: string;
}

export interface CreateAccountScreenProps {
  onCreate?: (account: Address) => void;
}

function CreateAccountScreen({ onCreate }: CreateAccountScreenProps) {
  const styles = useStyles();
  const router = useRouter();
  const approver = useApproverAddress();
  const create = useMutation(Create)[1];

  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { label: '' },
    mode: 'onChange',
  });

  return (
    <>
      <AppbarOptions mode="large" headline="Let's setup your account" />

      <ScreenSurface>
        <View style={styles.fields}>
          <AccountNameFormField name="label" control={control} required autoFocus />

          <Text>You can change your account name later</Text>
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            style={styles.button}
            control={control}
            onPress={handleSubmit(async ({ label }) => {
              try {
                const account = (
                  await create({
                    input: {
                      label,
                      policies: [{ name: 'High risk', approvers: [approver] }],
                    },
                  })
                ).data?.createAccount;

                if (onCreate) {
                  onCreate(account!.address);
                } else {
                  router.push({
                    pathname: `/(drawer)/[account]/(home)/`,
                    params: { account: account!.address },
                  });
                }
              } catch (error) {
                showError('Failed to create account', { event: { error } });
              }
            })}
          >
            Continue
          </FormSubmitButton>
        </Actions>
      </ScreenSurface>
    </>
  );
}

const useStyles = makeStyles(() => ({
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
}));

export default withSuspense(CreateAccountScreen, <ScreenSkeleton />);
