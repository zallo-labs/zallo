import { useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { useMutation } from 'urql';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { Actions } from '#/layout/Actions';
import { showError } from '#/provider/SnackbarProvider';
import { UAddress } from 'lib';
import { Text } from 'react-native-paper';
import { AccountNameFormField } from '#/fields/AccountNameFormField';
import { createStyles, useStyles } from '@theme/styles';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';
import { asPolicyInput } from '~/lib/policy/draft';
import { Chain } from 'chains';
import { useQuery } from '~/gql';
import { FormChainSelector } from './fields/FormChainSelector';

const Query = gql(/* GraphQL */ `
  query CreateAccountScreen {
    user {
      id
      approvers {
        id
        address
      }
      ...UsePolicyPresets_User
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
  chain: Chain;
}

export interface CreateAccountScreenProps {
  onCreate?: (account: UAddress) => void;
}

export function CreateAccount({ onCreate }: CreateAccountScreenProps) {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const create = useMutation(Create)[1];

  const { user } = useQuery(Query).data;

  const { control, handleSubmit, reset, watch } = useForm<Inputs>({
    defaultValues: { name: '', chain: 'zksync-sepolia' },
    mode: 'onChange',
  });

  const chain = watch('chain');
  const presets = usePolicyPresets({ chain, user, account: undefined });

  return (
    <>
      <View style={styles.container}>
        <Text variant="bodyLarge">You can update your account details at any time</Text>

        <AccountNameFormField
          name="name"
          label="Account name"
          control={control}
          required
          autoFocus
        />

        <FormChainSelector control={control} name="chain" />
      </View>

      <Actions>
        <FormSubmitButton
          mode="contained"
          style={styles.button}
          control={control}
          onPress={handleSubmit(async ({ name, chain }) => {
            const r = await create({
              input: { name, chain, policies: Object.values(presets).map(asPolicyInput) },
            });

            const account = r.data?.createAccount.address;
            if (!account)
              return showError('Failed to create account', { event: { error: r.error } });

            if (onCreate) {
              onCreate(account);
            } else {
              router.push({ pathname: `/(drawer)/[account]/(home)/`, params: { account } });
            }

            reset();
          })}
        >
          Continue
        </FormSubmitButton>
      </Actions>
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    marginHorizontal: 16,
    gap: 16,
  },
  chainContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginHorizontal: 16,
  },
  warning: {
    color: colors.warning,
  },
  button: {
    alignSelf: 'stretch',
  },
}));
