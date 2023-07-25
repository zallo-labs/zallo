import { gql } from '@api/gen';
import { Address } from 'lib';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useMutation } from 'urql';
import { Appbar } from '~/components/Appbar/Appbar';
import { NotFound } from '~/components/NotFound';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

const Query = gql(/* GraphQL */ `
  query RenameAccount($account: Address!) {
    account(input: { address: $account }) {
      id
      address
      name
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation RenameAccountUpdate($account: Address!, $name: String!) {
    updateAccount(input: { address: $account, name: $name }) {
      id
      name
    }
  }
`);

interface Inputs {
  name: string;
}

export interface RenameAccountModalParams {
  account: Address;
}

export type RenameAccountModalProps = StackNavigatorScreenProps<'RenameAccountModal'>;

export const RenameAccountModal = withSuspense(
  ({ route, navigation: { goBack } }: RenameAccountModalProps) => {
    const { account } = useQuery(Query, { account: route.params.account }).data;
    const update = useMutation(Update)[1];

    const { control, handleSubmit } = useForm<Inputs>({ defaultValues: { name: account?.name } });

    if (!account) return <NotFound name="Account" appbarProps={{ inset: false }} />;

    return (
      <Screen>
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
              goBack();
            })}
          >
            Update
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
  },
});
