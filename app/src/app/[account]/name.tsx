import { useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useMutation } from 'urql';
import { NotFound } from '~/components/NotFound';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { useQuery } from '~/gql';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { z } from 'zod';
import { zAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';

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

export const AccountNameModalParams = z.object({ account: zAddress });

export default function AccountNameModal() {
  const params = useLocalParams(`/[account]/name`, AccountNameModalParams);
  const router = useRouter();
  const update = useMutation(Update)[1];

  const { account } = useQuery(Query, { account: params.account }).data;
  const { control, handleSubmit } = useForm<Inputs>({ defaultValues: { name: account?.name } });

  if (!account) return <NotFound name="Account" />;

  return (
    <View style={styles.root}>
      <AppbarOptions mode="large" leading="close" headline="Rename Account" />

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
