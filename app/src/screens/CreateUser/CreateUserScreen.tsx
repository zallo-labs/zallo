import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet } from 'react-native';
import { Screen } from '~/components/layout/Screen';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { useUpdateUser, useUser } from '@api/user';
import { useState } from 'react';
import { RequireBiometricsItem } from '~/components/items/RequireBiometricsItem';
import { useSetRecoilState } from 'recoil';
import { approverAtom } from '@network/useApprover';
import { Approver, tryOr } from 'lib';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';

interface Inputs {
  name: string;
  phrase?: string;
}

export type CreateUserScreenProps = StackNavigatorScreenProps<'CreateUser'>;

export const CreateUserScreen = ({ navigation: { navigate } }: CreateUserScreenProps) => {
  const updateUser = useUpdateUser();
  const setApprover = useSetRecoilState(approverAtom);

  const [showPhrase, setShowPhrase] = useState(false);
  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      name: useUser().name ?? '',
    },
  });

  return (
    <Screen withoutTopInset>
      <AppbarLarge leading="back" headline="User" />

      <View style={styles.fields}>
        <FormTextField
          name="name"
          control={control}
          label="Name"
          supporting="Only visible by account members"
          containerStyle={styles.inset}
          autoFocus
          rules={{ required: true }}
        />

        {showPhrase && (
          <FormTextField
            name="phrase"
            control={control}
            label="Recovery phrase"
            placeholder="cat swing flag economy stadium alone churn speed unique patch report train"
            containerStyle={styles.inset}
            wrap
            autoFocus
            autoComplete="off"
            autoCapitalize="none"
            rules={{
              pattern: {
                value: /(?:\b\s*\w+){12,24}/,
                message: 'Must be 12–24 words',
              },
              validate: (value) =>
                !value || tryOr(() => Approver.fromMnemonic(value), false)
                  ? true
                  : 'Must be a valid BIP-39 phrase',
            }}
          />
        )}

        <RequireBiometricsItem />
      </View>

      <Actions>
        {!showPhrase && (
          <Button mode="text" style={styles.button} onPress={() => setShowPhrase(true)}>
            Import
          </Button>
        )}

        <FormSubmitButton
          mode="contained"
          style={styles.button}
          control={control}
          onPress={handleSubmit(({ name, phrase }) => {
            updateUser({ name });
            if (phrase) setApprover(Approver.fromMnemonic(phrase));

            navigate('CreateAccount');
          })}
        >
          Create user
        </FormSubmitButton>
      </Actions>
    </Screen>
  );
};

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
