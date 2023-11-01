import { useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { useApproverAddress } from '@network/useApprover';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { useMutation } from 'urql';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { showError } from '~/components/provider/SnackbarProvider';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { Address } from 'lib';
import { Text, TextInput } from 'react-native-paper';
import { CONFIG } from '~/util/config';
import { useState } from 'react';
import { makeStyles } from '@theme/makeStyles';
import { useUrqlApiClient } from '@api/client';

const LabelAvailable = gql(/* GraphQL */ `
  query CreateAccountScreen_LabelAvailable($label: String!) {
    labelAvailable(input: { label: $label })
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
  label: string;
}

export interface CreateAccountScreenProps {
  onCreate?: (account: Address) => void;
}

function CreateAccountScreen({ onCreate }: CreateAccountScreenProps) {
  const styles = useStyles();
  const router = useRouter();
  const approver = useApproverAddress();
  const api = useUrqlApiClient();
  const create = useMutation(Create)[1];

  const [isAvailable, setAvailable] = useState<boolean | 'checking'>(false);
  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { label: '' },
    mode: 'onChange',
  });

  return (
    <>
      <AppbarOptions mode="large" headline="Let's setup your account" />

      <ScreenSurface>
        <View style={styles.fields}>
          <FormTextField
            name="label"
            control={control}
            label="Name"
            placeholder="alisha"
            right={<TextInput.Affix text={CONFIG.ensSuffix} />}
            autoFocus
            required
            autoCapitalize="none"
            rules={{
              minLength: { value: 4, message: 'Too short' },
              maxLength: { value: 40, message: 'Too long' },
              pattern: {
                value: /^[0-9a-zA-Z$-]{4,40}$/,
                message: 'Must contain only alpha-numeric characters and: $ -',
              },
              validate: async (label) => {
                setAvailable('checking');
                const available = !!(await api.query(LabelAvailable, { label })).data
                  ?.labelAvailable;
                setAvailable(available);
                return available || 'Not available';
              },
            }}
            {...(isAvailable === true && {
              activeOutlineColor: styles.available.color,
              outlineColor: styles.available.color,
              supporting: 'Available',
              supportingStyle: styles.available,
            })}
            {...(isAvailable === 'checking' && {
              supporting: 'Checking availability...',
            })}
          />

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

const useStyles = makeStyles(({ colors }) => ({
  root: {
    flex: 1,
  },
  fields: {
    margin: 16,
    gap: 16,
  },
  available: {
    color: colors.success,
  },
  button: {
    alignSelf: 'stretch',
  },
}));

export default withSuspense(CreateAccountScreen, <ScreenSkeleton />);
