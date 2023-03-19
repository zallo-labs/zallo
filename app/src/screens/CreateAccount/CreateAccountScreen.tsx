import { useCreateAccount } from '@api/account';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
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

export const CreateAccountScreen = ({ navigation: { navigate } }: CreateAccountScreenProps) => {
  const createAccount = useCreateAccount();

  const { control, handleSubmit } = useForm<Inputs>();

  return (
    <Screen safeArea="withoutTop">
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
            const { id: account } = await createAccount(name);
            navigate('Home', { account });
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
