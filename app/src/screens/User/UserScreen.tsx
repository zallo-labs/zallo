import { useUpdateUser, useUser } from '@api/user';
import { ShareIcon } from '@theme/icons';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Appbar } from '~/components/Appbar/Appbar';
import { Button } from '~/components/Button';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { RequireBiometricsItem } from '~/components/items/RequireBiometricsItem';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { FormResetIcon } from '~/components/fields/ResetFormIcon';

interface Inputs {
  name: string;
}

export type UserScreenProps = StackNavigatorScreenProps<'User'>;

export const UserScreen = ({ navigation: { navigate } }: UserScreenProps) => {
  const user = useUser();
  const updateUser = useUpdateUser();

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: user.name },
  });

  return (
    <Screen>
      <Appbar
        mode="large"
        leading="back"
        headline="User"
        trailing={(props) => <FormResetIcon control={control} reset={reset} {...props} />}
      />

      <FormTextField
        label="Name"
        supporting="Only visible by account members"
        name="name"
        control={control}
        rules={{ required: true }}
        containerStyle={styles.nameContainer}
      />

      <RequireBiometricsItem />

      <Actions>
        <Button
          mode="contained-tonal"
          icon={ShareIcon}
          style={styles.actionButton}
          onPress={() => navigate('QrModal', { address: user.id })}
        >
          Share
        </Button>

        <FormSubmitButton
          mode="contained"
          requireChanges
          control={control}
          style={styles.actionButton}
          onPress={handleSubmit(async ({ name }) => {
            await updateUser({ name });
          })}
        >
          Update
        </FormSubmitButton>
      </Actions>
    </Screen>
  );
};

const styles = StyleSheet.create({
  nameContainer: {
    margin: 16,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
