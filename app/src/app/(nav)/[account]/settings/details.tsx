import { Pane } from '#/layout/Pane';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountSettingsParams } from './index';
import { useForm } from 'react-hook-form';
import { createStyles } from '@theme/styles';
import { Appbar } from '#/Appbar/Appbar';
import { Surface } from '#/layout/Surface';
import { View } from 'react-native';
import { AccountNameFormField } from '#/fields/AccountNameFormField';
import { Actions } from '#/layout/Actions';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { details_AccountDetailsQuery } from '~/api/__generated__/details_AccountDetailsQuery.graphql';
import { useMutation } from '~/api';
import { details_AccountDetailsMutation } from '~/api/__generated__/details_AccountDetailsMutation.graphql';

const Query = graphql`
  query details_AccountDetailsQuery($account: UAddress!) {
    account(address: $account) @required(action: THROW) {
      id
      address
      name
    }
  }
`;

const Update = graphql`
  mutation details_AccountDetailsMutation($account: UAddress!, $name: String!) @raw_response_type {
    updateAccount(input: { account: $account, name: $name }) {
      id
      name
    }
  }
`;

interface Inputs {
  name: string;
}

export default function AccountDetails() {
  const { account } = useLocalParams(AccountSettingsParams);
  const update = useMutation<details_AccountDetailsMutation>(Update);

  const a = useLazyLoadQuery<details_AccountDetailsQuery>(Query, { account }).account;

  const { control, handleSubmit, reset } = useForm<Inputs>({ defaultValues: { name: a?.name } });

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
              await update(
                { account, name: input.name },
                { optimisticResponse: { updateAccount: { id: a.id, name: input.name } } },
              );
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
