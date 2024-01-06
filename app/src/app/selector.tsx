import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { Subject } from 'rxjs';

import { asSelector, Selector } from 'lib';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { useGetEvent } from '~/hooks/useGetEvent';

const SELECTOR_ADDED = new Subject<Selector>();

export function useGetSelector() {
  const getEvent = useGetEvent();

  return () => getEvent(`/selector`, SELECTOR_ADDED);
}

interface Inputs {
  selector: string;
}

export default function SelectorModal() {
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
            SELECTOR_ADDED.next(asSelector(selector));
          })}
        >
          Add action
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
