import { Pane } from '#/layout/Pane';
import { gql } from '@api';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountSettingsParams } from './index';
import { NotFound } from '#/NotFound';
import { useMutation } from 'urql';
import { useForm } from 'react-hook-form';
import { createStyles } from '@theme/styles';
import { Appbar } from '#/Appbar/Appbar';
import { Surface } from '#/layout/Surface';
import { View } from 'react-native';
import { AccountNameFormField } from '#/fields/AccountNameFormField';
import { Actions } from '#/layout/Actions';
import { FormSubmitButton } from '#/fields/FormSubmitButton';

const Query = gql(/* GraphQL */ `
  query AccountDetails($account: UAddress!) {
    account(input: { account: $account }) {
      id
      address
      name
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation AccountDetails_Update($account: UAddress!, $name: String!) {
    updateAccount(input: { account: $account, name: $name }) {
      id
      name
    }
  }
`);

interface Inputs {
  name: string;
}

export default function AccountDetails() {
  const { account } = useLocalParams(AccountSettingsParams);
  const update = useMutation(Update)[1];

  const a = useQuery(Query, { account }).data.account;

  const { control, handleSubmit, reset } = useForm<Inputs>({ defaultValues: { name: a?.name } });

  if (!a) return <NotFound name="Account" />;

  return (
    <Pane flex>
      <Appbar mode="large" headline="Account details" />

      <Surface style={styles.surface}>
        <View style={styles.fields}>
          <AccountNameFormField name="name" control={control} required />
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            requireChanges
            control={control}
            onPress={handleSubmit(async (input) => {
              await update({ account, name: input.name });
              reset(input);
            })}
          >
            Update
          </FormSubmitButton>
        </Actions>
      </Surface>
    </Pane>
  );
}

const styles = createStyles({
  surface: {
    flex: 1,
    marginBottom: 16,
  },
  fields: {
    margin: 16,
  },
});
