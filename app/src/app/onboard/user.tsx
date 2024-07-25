import { Appbar } from '#/Appbar/Appbar';
import { Button } from '#/Button';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { LinkAppleButton } from '#/link/LinkAppleButton';
import { LinkGoogleButton } from '#/link/LinkGoogleButton';
import { OnboardLinkingPane } from '#/onboard/OnboardLinkingPane';
import { OnboardMainPane } from '#/onboard/OnboardMainPane';
import { OnboardProgress } from '#/onboard/OnboardProgress';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { zodResolver } from '@hookform/resolvers/zod';
import { QrCodeIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';
import { z } from 'zod';
import { useLazyQuery, useMutation } from '~/api';
import { user_UserOnboardingMutation } from '~/api/__generated__/user_UserOnboardingMutation.graphql';
import { user_UserOnboardingQuery } from '~/api/__generated__/user_UserOnboardingQuery.graphql';
import { user_UserOnboardingSubscription } from '~/api/__generated__/user_UserOnboardingSubscription.graphql';
import { getDeviceModel } from '~/lib/device';
import { TERMS_OF_SERVICE_HREF } from '../terms-of-service';

const Query = graphql`
  query user_UserOnboardingQuery {
    approver {
      id
      label
    }

    user {
      id
      ...LinkAppleButton_user
      ...LinkGoogleButton_user
    }
  }
`;

const Update = graphql`
  mutation user_UserOnboardingMutation($name: String!) {
    updateApprover(input: { name: $name }) {
      id
      label
    }
  }
`;

const Subscription = graphql`
  subscription user_UserOnboardingSubscription {
    userLinked {
      id
    }
  }
`;

const schema = z.object({ name: z.string().min(1) });

function UserOnboarding() {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const update = useMutation<user_UserOnboardingMutation>(Update);

  const { approver, user } = useLazyQuery<user_UserOnboardingQuery>(Query, {});

  const { control, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: approver.label || getDeviceModel() },
  });

  const next = useMemo(
    () =>
      handleSubmit((input) => {
        update({ name: input.name });
        reset(input);

        router.push('/onboard/auth');
      }),
    [handleSubmit, reset, router, update],
  );

  useSubscription<user_UserOnboardingSubscription>(
    useMemo(() => ({ subscription: Subscription, variables: {}, onNext: () => next() }), [next]),
  );

  return (
    <View style={styles.screen}>
      <OnboardMainPane contentContainerStyle={styles.pane} stickyHeaderIndices={[0]}>
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
          <Link href="/accounts/join" asChild>
            <Button mode="contained-tonal" icon={QrCodeIcon}>
              Continue with Zallo
            </Button>
          </Link>

          <LinkGoogleButton user={user} onLink={next} />
          <LinkAppleButton user={user} onLink={next} />

          <FormSubmitButton mode="outlined" control={control} onPress={next}>
            Continue
          </FormSubmitButton>

          <Text variant="titleMedium" style={styles.tosText}>
            By continuing, you agree to our{' '}
            <Link href={TERMS_OF_SERVICE_HREF} style={styles.link}>
              Terms of Service
            </Link>
          </Text>
        </Actions>
      </OnboardMainPane>

      <OnboardLinkingPane />
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  screen: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  pane: {
    gap: 8,
  },
  container: {
    paddingHorizontal: 16,
  },
  input: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  tosText: {
    marginVertical: 8,
    textAlign: 'center',
  },
  link: {
    color: colors.tertiary,
  },
}));

export default withSuspense(UserOnboarding, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
