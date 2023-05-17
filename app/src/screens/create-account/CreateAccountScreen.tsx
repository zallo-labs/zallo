import { useCreateAccount } from '@api/account';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useSetSelectedAccount } from '~/components/AccountSelector/useSelectedAccount';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

interface Inputs {
  name: string;
}

export type CreateAccountScreenProps = StackNavigatorScreenProps<'CreateAccount'>;

export const CreateAccountScreen = ({ navigation: { replace } }: CreateAccountScreenProps) => {
  const createAccount = useCreateAccount();
  const setSelected = useSetSelectedAccount();

  const { control, handleSubmit } = useForm<Inputs>();

  return (
    <Screen>
      <Appbar mode="large" leading="back" headline="Account" />

      <View style={styles.fields}>
        <FormTextField
          name="name"
          control={control}
          label="Name"
          placeholder="Personal"
          supporting="Only visible by account members"
          autoFocus
          rules={{ required: true }}
        />
      </View>

      <Actions>
        <FormSubmitButton
          mode="contained"
          style={styles.button}
          control={control}
          onPress={handleSubmit(async ({ name }) => {
            const { address } = await createAccount(name);
            // setSelected(address);  // Changing to a new account for the first time is taking a while for some reason, so is disabled right now
            replace('Home');
          })}
        >
          Create account
        </FormSubmitButton>
      </Actions>
    </Screen>
  );
};

const styles = StyleSheet.create({
  fields: {
    margin: 16,
    gap: 16,
  },
  button: {
    alignSelf: 'stretch',
  },
});
