import { SearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { TextInput } from 'react-native-paper';
import { gql } from '@api/generated';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { NotFound } from '~/components/NotFound';
import { Suspend } from '~/components/Suspender';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { AuthSettingsScreenParams } from '~/app/settings/auth';
import { DEVICE_MODEL } from '~/lib/device';

const Query = gql(/* GraphQL */ `
  query ApproverOnboarding {
    approver {
      id
      address
      name
    }

    user {
      id
      name
      approvers {
        id
        name
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation ApproverOnboarding_update($name: String!) {
    updateApprover(input: { name: $name }) {
      id
      name
      label
    }
  }
`);

interface Inputs {
  name: string;
}

export type ApproverOnboardingScreenRoute = `/onboard/approver`;
export type ApproverOnboardingScreenParams = SearchParams<ApproverOnboardingScreenRoute>;

export default function ApproverOnboardingScreen() {
  const router = useRouter();
  const query = useQuery(Query);
  const { approver, user } = query.data;
  const update = useMutation(Update)[1];

  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { name: approver?.name ?? DEVICE_MODEL ?? '' },
  });

  if (!approver) return query.stale ? <Suspend /> : <NotFound name="Approver" />;

  const takenNames = user.approvers.filter((a) => a.id !== approver.id).map((a) => a.name);

  return (
    <View style={styles.root}>
      <AppbarOptions mode="large" headline="Approver" />

      <View style={styles.fields}>
        <FormTextField
          name="name"
          control={control}
          left={user.name ? <TextInput.Affix text={`${user.name}'s`} /> : undefined}
          label="Label"
          placeholder="iPhone"
          autoFocus
          containerStyle={styles.inset}
          rules={{
            required: true,
            validate: (v) => !takenNames.includes(v) || 'An approver with ths name already exists',
          }}
          onBlur={handleSubmit(async ({ name }) => {
            await update({ name });
          })}
        />
      </View>

      <Actions>
        <FormSubmitButton
          mode="contained"
          style={styles.button}
          control={control}
          onPress={() => {
            const params: AuthSettingsScreenParams = { onboard: 'true' };
            router.push({ pathname: `/settings/auth`, params });
          }}
        >
          Continue
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
    marginVertical: 16,
    gap: 16,
  },
  inset: {
    marginHorizontal: 16,
  },
  button: {
    alignSelf: 'stretch',
  },
});
