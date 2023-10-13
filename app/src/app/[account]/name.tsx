import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { asAddress } from 'lib';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useMutation } from 'urql';
import { Appbar } from '~/components/Appbar/Appbar';
import { NotFound } from '~/components/NotFound';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query AccountNameModal($account: Address!) {
    account(input: { address: $account }) {
      id
      address
      name
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation AccountNameModal_Update($account: Address!, $name: String!) {
    updateAccount(input: { address: $account, name: $name }) {
      id
      name
    }
  }
`);

interface Inputs {
  name: string;
}

export type AccountNameModalRoute = `/[account]/name`;
export type AccountNameModalParams = SearchParams<AccountNameModalRoute>;

export default function AccountNameModal() {
  const params = useLocalSearchParams<AccountNameModalParams>();
  const router = useRouter();
  const update = useMutation(Update)[1];

  const { account } = useQuery(Query, { account: asAddress(params.account) }).data;
  const { control, handleSubmit } = useForm<Inputs>({ defaultValues: { name: account?.name } });

  if (!account) return <NotFound name="Account" />;

  return (
    <View style={styles.root}>
      <Appbar mode="large" inset={false} leading="close" headline="Rename Account" />

      <View style={styles.fields}>
        <FormTextField label="Name" control={control} name="name" rules={{ required: true }} />
      </View>

      <Actions>
        <FormSubmitButton
          mode="contained"
          requireChanges
          control={control}
          onPress={handleSubmit(async ({ name }) => {
            await update({ account: account.address, name });
            router.back();
          })}
        >
          Update
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
  },
});
