import { useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { useMutation } from 'urql';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { Actions } from '#/layout/Actions';
import { showError } from '#/provider/SnackbarProvider';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { UAddress } from 'lib';
import { Text } from 'react-native-paper';
import { AccountNameFormField } from '#/fields/AccountNameFormField';
import { createStyles, useStyles } from '@theme/styles';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';
import { asPolicyInput } from '~/lib/policy/draft';
import { CHAINS, Chain } from 'chains';
import { FormSelectChip } from '#/fields/FormSelectChip';
import { CHAIN_ENTRIES } from '@network/chains';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query CreateAccountScreen {
    user {
      id
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
  label: string;
  chain: Chain;
}

export interface CreateAccountScreenProps {
  onCreate?: (account: UAddress) => void;
}

function CreateAccountScreen({ onCreate }: CreateAccountScreenProps) {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const create = useMutation(Create)[1];

  const { user } = useQuery(Query).data;

  const { control, handleSubmit, reset, watch } = useForm<Inputs>({
    defaultValues: { label: '', chain: 'zksync-sepolia' },
    mode: 'onChange',
  });

  const chain = watch('chain');
  const presets = usePolicyPresets({ chain, user, account: undefined });

  return (
    <>
      <AppbarOptions mode="large" headline="Let's setup your account" />

      <ScrollableScreenSurface>
        <View style={styles.nameContainer}>
          <Text variant="bodyMedium" style={styles.nameChangeText}>
            You can change your account name later
          </Text>

          <AccountNameFormField
            name="label"
            label="Account name"
            control={control}
            required
            autoFocus
          />
        </View>

        <View style={styles.chainContainer}>
          <FormSelectChip name="chain" control={control} entries={CHAIN_ENTRIES} />

          {CHAINS[chain].testnet && (
            <Text variant="titleSmall" style={styles.warning}>
              This network is only useful for testing purposes
            </Text>
          )}
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            style={styles.button}
            control={control}
            onPress={handleSubmit(async ({ label, chain }) => {
              const r = await create({
                input: { label, chain, policies: [asPolicyInput(presets.high)] },
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
      </ScrollableScreenSurface>
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  root: {
    flex: 1,
  },
  nameContainer: {
    margin: 16,
    gap: 16,
  },
  nameChangeText: {
    textAlign: 'center',
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

export default withSuspense(CreateAccountScreen, <ScreenSkeleton />);
