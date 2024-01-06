import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useMutation } from 'urql';
import { z } from 'zod';

import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { AccountNameFormField } from '~/components/fields/AccountNameFormField';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { Actions } from '~/components/layout/Actions';
import { NotFound } from '~/components/NotFound';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zUAddress } from '~/lib/zod';

const Query = gql(/* GraphQL */ `
  query AccountNameModal($account: UAddress!) {
    account(input: { account: $account }) {
      id
      address
      label
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation AccountNameModal_Update($account: UAddress!, $label: String!) {
    updateAccount(input: { account: $account, label: $label }) {
      id
      label
      name
    }
  }
`);

interface Inputs {
  label: string;
}

export const AccountNameModalParams = z.object({ account: zUAddress() });

function AccountNameModal() {
  const params = useLocalParams(AccountNameModalParams);
  const router = useRouter();
  const update = useMutation(Update)[1];

  const { account } = useQuery(Query, { account: params.account }).data;
  const { control, handleSubmit } = useForm<Inputs>({ defaultValues: { label: account?.label } });

  if (!account) return <NotFound name="Account" />;

  return (
    <View style={styles.root}>
      <AppbarOptions mode="large" leading="close" headline="Rename Account" />

      <View style={styles.fields}>
        <AccountNameFormField name="label" control={control} required autoFocus />
      </View>

      <Actions>
        <FormSubmitButton
          mode="contained"
          requireChanges
          control={control}
          onPress={handleSubmit(async ({ label }) => {
            await update({ account: account.address, label });
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

export default withSuspense(AccountNameModal, <ScreenSkeleton />);
