import { Appbar } from '#/Appbar/Appbar';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { LinkAppleButton } from '#/link/LinkAppleButton';
import { LinkGoogleButton } from '#/link/LinkGoogleButton';
import { LinkZalloButton } from '#/link/LinkZalloButton';
import { LinkLedgerButton } from '#/link/ledger/LinkLedgerButton';
import { OnboardProgress } from '#/onboard/OnboardProgress';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { gql } from '@api';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStyles, useStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { useMutation } from 'urql';
import { z } from 'zod';
import { useQuery } from '~/gql';
import { getDeviceModel } from '~/lib/device';

const Query = gql(/* GraphQL */ `
  query UserOnboarding {
    approver {
      id
      name
    }

    user {
      id
      ...LinkAppleButton_User
      ...LinkGoogleButton_User
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation UserOnboarding_Update($name: String!) {
    updateApprover(input: { name: $name }) {
      id
      name
    }
  }
`);

const schema = z.object({ name: z.string().min(1) });

function UserOnboarding() {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const update = useMutation(Update)[1];

  const { approver, user } = useQuery(Query).data;

  const { control, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: approver.name || getDeviceModel() },
  });

  return (
    <ScrollView contentContainerStyle={styles.pane} stickyHeaderIndices={[0]}>
      <View>
        <OnboardProgress progress={0.2} />
        <Appbar mode="large" headline="Let's get you started" inset={false} />
      </View>

      <FormTextField
        label="Device name"
        supporting="Used by account members to identify this device"
        name="name"
        control={control}
        required
        containerStyle={styles.input}
      />

      <Actions>
        <LinkZalloButton />
        <LinkLedgerButton />
        <LinkGoogleButton user={user} />
        <LinkAppleButton user={user} />

        <FormSubmitButton
          mode="contained"
          control={control}
          onPress={handleSubmit((input) => {
            update({ name: input.name });
            reset(input);

            router.push('/onboard/auth');
          })}
        >
          Continue
        </FormSubmitButton>
      </Actions>
    </ScrollView>
  );
}

const stylesheet = createStyles(() => ({
  pane: {
    flexGrow: 1,
    gap: 8,
  },
  container: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },
}));

export default withSuspense(UserOnboarding, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
