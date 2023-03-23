import { useCreateAccount } from '@api/account';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useSetSelectedAccount } from '~/components/AccountSelector/useSelectedAccount';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';

interface Inputs {
  name: string;
}

export type CreateAccountScreenProps = StackNavigatorScreenProps<'CreateAccount'>;

export const CreateAccountScreen = ({ navigation: { replace } }: CreateAccountScreenProps) => {
  const createAccount = useCreateAccount();
  const setSelected = useSetSelectedAccount();

  const { control, handleSubmit } = useForm<Inputs>();

  return (
    <Screen withoutTopInset>
      <AppbarLarge leading="back" headline="Account" />

      <View style={styles.fields}>
        <FormTextField
          name="name"
          control={control}
          label="Name"
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
            const { id } = await createAccount(name);
            setSelected(id);
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
