import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { Actions } from '#/layout/Actions';
import { UAddress } from 'lib';
import { Text } from 'react-native-paper';
import { AccountNameFormField } from '#/fields/AccountNameFormField';
import { createStyles, useStyles } from '@theme/styles';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';
import { asPolicyInput } from '~/lib/policy/policyAsDraft';
import { Chain } from 'chains';
import { FormChainSelector } from './fields/FormChainSelector';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { CreateAccountScreenQuery } from '~/api/__generated__/CreateAccountScreenQuery.graphql';
import { useCreateAccount } from '~/hooks/mutations/useCreateAccount';

const Query = graphql`
  query CreateAccountScreenQuery {
    user {
      id
      approvers {
        id
        address
      }
      ...usePolicyPresets_user
    }

    ...useCreateAccount_query
  }
`;

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

  const query = useLazyQuery<CreateAccountScreenQuery>(Query, {});
  const create = useCreateAccount({ query });
  const { user } = query;

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

        <FormChainSelector control={control} name="chain" style={styles.chainSelector} />
      </View>

      <Actions horizontal style={styles.actions}>
        <FormSubmitButton
          mode="contained"
          control={control}
          onPress={handleSubmit(async ({ name, chain }) => {
            const r = await create({
              input: { name, chain, policies: Object.values(presets).map(asPolicyInput) },
            });

            const account = r.createAccount.address;
            if (onCreate) {
              onCreate(account);
            } else {
              router.push({ pathname: `/(nav)/[account]/(home)/`, params: { account } });
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
  chainSelector: {
    marginTop: 16,
  },
  actions: {
    // alignItems: 'flex-end',
    // justifyContent: {
    //   compact: 'flex-end',
    //   large: 'flex-start',
    // },
  },
}));
