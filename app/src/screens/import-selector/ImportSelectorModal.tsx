import { Selector, asSelector } from 'lib';
import { EventEmitter } from '~/util/EventEmitter';
import { StackNavigatorScreenProps } from '../../navigation/StackNavigator';
import { Screen } from '~/components/layout/Screen';
import { Appbar } from '~/components/Appbar/Appbar';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { StyleSheet } from 'react-native';
import { Actions } from '~/components/layout/Actions';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';

const IMPORT_SELECTOR_EMITTER = new EventEmitter<Selector>();
export const useImportSelector = IMPORT_SELECTOR_EMITTER.createUseSelect('ImportSelectorModal');

interface Inputs {
  selector: string;
}

export type ImportSelectorModalProps = StackNavigatorScreenProps<'ImportSelectorModal'>;

export const ImportSelectorModal = (props: ImportSelectorModalProps) => {
  const { control, handleSubmit } = useForm<Inputs>();

  return (
    <Screen>
      <Appbar mode="large" inset={false} leading="close" headline="Add interaction" />

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
            IMPORT_SELECTOR_EMITTER.emit(asSelector(selector));
          })}
        >
          Add interaction
        </FormSubmitButton>
      </Actions>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: {
    margin: 16,
  },
});
