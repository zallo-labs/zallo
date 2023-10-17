import { SearchParams, Stack, useRouter } from 'expo-router';
import { useImmerAtom } from 'jotai-immer';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';

const trimmed = (v: string) => v.trim();

const Query = gql(/* GraphQL */ `
  query RenamePolicySheet($account: Address!) {
    account(input: { address: $account }) {
      id
      policies {
        id
        key
        name
      }
    }
  }
`);

const Rename = gql(/* GraphQL */ `
  mutation RenamePolicySheet_Rename($account: Address!, $key: PolicyKey!, $name: String!) {
    updatePolicy(input: { account: $account, key: $key, name: $name }) {
      id
      name
    }
  }
`);

interface Inputs {
  name: string;
}

export type PolicyNameModalRoute = `/[account]/policies/[key]/name`;
export type PolicyNameModalParams = SearchParams<PolicyNameModalRoute>;

export default function PolicyNameModal() {
  const router = useRouter();
  const rename = useMutation(Rename)[1];

  const [draft, updateDraft] = useImmerAtom(POLICY_DRAFT_ATOM);
  const { account } = useQuery(Query, { account: draft.account }).data;
  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { name: draft.name },
  });

  const takenNames = new Set(
    account?.policies.filter((p) => p.key !== draft.key).map((p) => p.name) ?? [],
  );

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <AppbarOptions mode="large" leading="close" headline="Rename policy" />

      <FormTextField
        label="Name"
        autoFocus
        control={control}
        name="name"
        containerStyle={styles.field}
        rules={{
          required: true,
          minLength: 1,
          pattern: {
            value: /\S+/,
            message: 'Name cannot contain only whitespace',
          },
          validate: (value) =>
            !takenNames.has(trimmed(value)) || 'Account already has a policy with this name',
        }}
      />

      <Actions>
        <FormSubmitButton
          mode="contained"
          control={control}
          onPress={handleSubmit(async ({ name }) => {
            name = trimmed(name);

            if (name !== draft.name) {
              updateDraft((draft) => {
                draft.name = name;
              });

              if (draft.key !== undefined)
                await rename({ account: draft.account, key: draft.key, name });
            }

            router.back();
          })}
        >
          Rename
        </FormSubmitButton>
      </Actions>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  field: {
    margin: 16,
  },
});
