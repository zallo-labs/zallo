import { View } from 'react-native';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet } from 'react-native';
import { Screen } from '~/components/layout/Screen';
import { Appbar } from '~/components/Appbar/Appbar';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { TextInput } from 'react-native-paper';
import * as Device from 'expo-device';
import { match, P } from 'ts-pattern';
import { Button } from '~/components/Button';
import { QrCodeIcon } from '@theme/icons';
import { Address } from 'viem';
import { gql } from '@api/generated';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query ApproverDetails($approver: Address) {
    approver(input: { address: $approver }) {
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
  mutation ApproverScreen_update($name: String!) {
    updateApprover(input: { name: $name }) {
      id
      name
      label
    }
  }
`);

const modelName = match(Device.modelName)
  .with(P.string.includes('iPhone'), () => 'iPhone')
  .with(P.string.includes('Pixel'), () => 'Pixel')
  .with(P.string.includes('Galaxy'), () => 'Galaxy')
  .otherwise(() => undefined);

interface Inputs {
  name: string;
}

export interface ApproverScreenParams {
  approver?: Address;
  isOnboarding?: boolean;
}

export type ApproverScreenProps = StackNavigatorScreenProps<'Approver'>;

export const ApproverScreen = withSuspense(
  ({ route, navigation: { navigate } }: ApproverScreenProps) => {
    const { isOnboarding } = route.params;

    const { approver, user } = useQuery(Query, { approver: route.params.approver }).data;
    const update = useMutation(Update)[1];

    const { control, handleSubmit } = useForm<Inputs>({
      defaultValues: { name: approver.name ?? modelName },
    });

    const takenNames = user.approvers.filter((a) => a.id !== approver.id).map((a) => a.name);

    return (
      <Screen>
        <Appbar mode="large" leading="back" headline="Approver" />

        <View style={styles.fields}>
          <FormTextField
            name="name"
            control={control}
            left={user.name ? <TextInput.Affix text={`${user.name}'s`} /> : undefined}
            label="Label"
            supporting="This device"
            placeholder="iPhone"
            autoFocus={isOnboarding}
            containerStyle={styles.inset}
            rules={{
              required: true,
              validate: (v) =>
                !takenNames.includes(v) || 'An approver with ths name already exists',
            }}
            onEndEditing={handleSubmit(async ({ name }) => {
              await update({ name });
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
                navigate('Biometrics', { isOnboarding: true });
              }}
            >
              Continue
            </FormSubmitButton>
          )}

          {!isOnboarding && (
            <Button
              mode="contained"
              icon={QrCodeIcon}
              onPress={() => navigate('QrModal', { address: approver.address })}
            >
              View
            </Button>
          )}
        </Actions>
      </Screen>
    );
  },
  ScreenSkeleton,
);

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
