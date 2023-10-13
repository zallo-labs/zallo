import { useImmerAtom } from 'jotai-immer';
import { ContractPermissionsScheme } from '~/app/[account]/policies/[key]/[contract]/';
import { useLocalParams } from '~/hooks/useLocalParams';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { Selector } from 'lib';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { StyleSheet, View } from 'react-native';
import { Actions } from '~/components/layout/Actions';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';

interface Inputs {
  selector: string;
}

export default function AddSelectorModal() {
  const { account } = useLocalParams(
    `/[account]/policies/[key]/[contract]/add-selector`,
    ContractPermissionsScheme,
  );

  const [, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);
  const { control, handleSubmit } = useForm<Inputs>();

  return (
    <View style={styles.root}>
      <AppbarOptions mode="large" headline="Add interaction" />

      <FormTextField
        label="Selector"
        placeholder="0x12345678"
        control={control}
        name="selector"
        containerStyle={styles.input}
        rules={{
          required: true,
          pattern: {
            value: /^0x?[0-9a-fA-F]{8}$/,
            message: 'Must be a 4 byte selector; e.g. 0x12345678',
          },
        }}
      />

      <Actions>
        <FormSubmitButton
          mode="contained"
          control={control}
          onPress={handleSubmit(({ selector }) => {
            updatePolicy((draft) => {
              draft.permissions.targets.contracts[account].functions[selector as Selector] = true;
            });
          })}
        >
          Add interaction
        </FormSubmitButton>
      </Actions>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  input: {
    margin: 16,
  },
});
