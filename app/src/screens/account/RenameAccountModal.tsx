import { useAccount, useUpdateAccount } from '@api/account';
import { Address } from 'lib';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Appbar } from '~/components/Appbar/Appbar';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

interface Inputs {
  name: string;
}

export interface RenameAccountModalParams {
  account: Address;
}

export type RenameAccountModalProps = StackNavigatorScreenProps<'RenameAccountModal'>;

export const RenameAccountModal = withSuspense(
  ({ route, navigation: { goBack } }: RenameAccountModalProps) => {
    const account = useAccount(route.params.account);
    const update = useUpdateAccount(account);

    const { control, handleSubmit } = useForm<Inputs>({ defaultValues: { name: account.name } });

    return (
      <Screen>
        <Appbar mode="large" inset={false} leading="close" headline="Rename Account" />

        <View style={styles.fields}>
          <FormTextField label="Name" control={control} name="name" rules={{ required: true }} />
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            requireChanges
            control={control}
            onPress={handleSubmit(async ({ name }) => {
              await update({ name });
              goBack();
            })}
          >
            Update
          </FormSubmitButton>
        </Actions>
      </Screen>
    );
  },
  ScreenSkeleton,
);

const styles = StyleSheet.create({
  fields: {
    margin: 16,
  },
});
