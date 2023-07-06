import { View } from 'react-native';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet } from 'react-native';
import { Screen } from '~/components/layout/Screen';
import { Appbar } from '~/components/Appbar/Appbar';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { gql, useSuspenseQuery } from '@apollo/client';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import {
  ApproverDetailsDocument,
  ApproverDetailsQuery,
  ApproverDetailsQueryVariables,
  useApproverUpdateMutation,
} from '@api/generated';
import { TextInput } from 'react-native-paper';
import * as Device from 'expo-device';
import { clog } from '~/util/format';
import { match, P } from 'ts-pattern';

gql`
  query ApproverDetails {
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

  mutation ApproverUpdate($input: UpdateApproverInput!) {
    updateApprover(input: $input) {
      id
      name
      label
    }
  }
`;

const modelName = match(Device.modelName)
  .with(P.string.includes('iPhone'), () => 'iPhone')
  .with(P.string.includes('Pixel'), () => 'Pixel')
  .with(P.string.includes('Galaxy'), () => 'Galaxy')
  .otherwise(() => undefined);

interface Inputs {
  name: string;
}

export type ApproverScreenProps = StackNavigatorScreenProps<'Approver'>;

export const ApproverScreen = withSuspense(({ navigation: { navigate } }: ApproverScreenProps) => {
  const isOnboarding = true;
  const [update] = useApproverUpdateMutation();
  const { approver, user } = useSuspenseQuery<ApproverDetailsQuery, ApproverDetailsQueryVariables>(
    ApproverDetailsDocument,
  ).data;

  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: { name: approver.name ?? modelName },
  });

  clog(Device);

  const takenNames = user.approvers.filter((a) => a.id !== approver.id).map((a) => a.name);

  return (
    <Screen>
      <Appbar mode="large" leading="back" headline="Approver" />

      <View style={styles.fields}>
        <FormTextField
          name="name"
          control={control}
          left={<TextInput.Affix text={`${user.name}'s`} />}
          label="Label"
          // supporting="Only visible by account members"
          supporting="This device"
          placeholder="iPhone"
          autoFocus
          containerStyle={styles.inset}
          rules={{
            required: true,
            validate: (v) => !takenNames.includes(v) || 'An approver with ths name already exists',
          }}
          onEndEditing={handleSubmit(async ({ name }) => {
            await update({ variables: { input: { name } } });
          })}
        />
      </View>

      <Actions>
        {isOnboarding && (
          <FormSubmitButton
            mode="contained"
            style={styles.button}
            control={control}
            onPress={() => {
              navigate('NotificationSettings', { onboard: true });
            }}
          >
            Continue
          </FormSubmitButton>
        )}
      </Actions>
    </Screen>
  );
}, ScreenSkeleton);

const styles = StyleSheet.create({
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
