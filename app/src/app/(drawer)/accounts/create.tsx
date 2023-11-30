import { useRouter } from 'expo-router';
import { gql } from '@api/generated';
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
import { UAddress } from 'lib';
import { Text } from 'react-native-paper';
import { AccountNameFormField } from '~/components/fields/AccountNameFormField';
import { createStyles } from '@theme/styles';
import { usePolicyPresets } from '~/lib/policy/presets';
import { asPolicyInput } from '~/lib/policy/draft';
import { useState } from 'react';
import { Chain } from 'chains';

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
  onCreate?: (account: UAddress) => void;
}

function CreateAccountScreen({ onCreate }: CreateAccountScreenProps) {
  const router = useRouter();
  const create = useMutation(Create)[1];

  const [chain, setChain] = useState<Chain>('zksync-goerli'); // TODO: <SelectChain />
  const presets = usePolicyPresets({ chain, account: undefined });

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
              const r = await create({ input: { label, policies: [asPolicyInput(presets.high)] } });

              const account = r.data?.createAccount.address;
              if (!account)
                return showError('Failed to create account', { event: { error: r.error } });

              if (onCreate) {
                onCreate(account);
              } else {
                router.push({ pathname: `/(drawer)/[account]/(home)/`, params: { account } });
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

const styles = createStyles({
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

export default withSuspense(CreateAccountScreen, <ScreenSkeleton />);
