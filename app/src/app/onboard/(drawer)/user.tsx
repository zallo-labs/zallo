import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { gql } from '@api/generated';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

const Query = gql(/* GraphQL */ `
  query UserOnboarding {
    user {
      id
      name
      approvers {
        id
        name
      }
    }

    approver {
      id
      name
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation UserOnboarding_Update($user: String!, $approver: String!) {
    updateUser(input: { name: $user }) {
      id
      name
    }

    updateApprover(input: { name: $approver }) {
      id
      name
    }
  }
`);

interface Inputs {
  user: string;
  approver: string;
}

function UserOnboardingScreen() {
  const router = useRouter();
  const { user, approver } = useQuery(Query).data;
  const update = useMutation(Update)[1];

  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { user: user.name ?? '', approver: approver?.name ?? '' },
  });

  const takenNames = user.approvers.filter((a) => a.id !== approver?.id).map((a) => a.name);

  return (
    <>
      <AppbarOptions mode="large" headline="Let's setup your user" />

      <ScreenSurface>
        <View style={styles.fields}>
          <FormTextField
            label="Name"
            placeholder="Alisha"
            autoFocus
            name="user"
            control={control}
            rules={{ required: true }}
          />

          <FormTextField
            label="Device"
            placeholder="iPhone"
            autoFocus
            name="approver"
            control={control}
            rules={{
              required: true,
              validate: (v) =>
                !takenNames.includes(v) || 'An approver with ths name already exists',
            }}
          />
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            control={control}
            onPress={handleSubmit(({ user, approver }) => {
              update({ user, approver });
              router.push(`/onboard/(drawer)/auth`);
            })}
          >
            Continue
          </FormSubmitButton>
        </Actions>
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignSelf: 'center',
    width: 600,
  },
  fields: {
    margin: 16,
    gap: 16,
  },
});

export default withSuspense(UserOnboardingScreen, <ScreenSkeleton />);
