import { gql } from '@api';
import { useUrqlApiClient } from '@api/client';
import { makeStyles } from '@theme/makeStyles';
import { useState } from 'react';
import { FieldValues, FieldPath } from 'react-hook-form';
import { TextInput } from 'react-native-paper';
import { FormTextField, FormTextFieldProps } from '~/components/fields/FormTextField';
import { CONFIG } from '~/util/config';

const LabelAvailable = gql(/* GraphQL */ `
  query AccountNameFormField_LabelAvailable($label: String!) {
    labelAvailable(input: { label: $label })
  }
`);

export interface AccountNameFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends FormTextFieldProps<TFieldValues, TName> {}

export function AccountNameFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: AccountNameFormFieldProps<TFieldValues, TName>) {
  const styles = useStyles();
  const api = useUrqlApiClient();

  const [isAvailable, setAvailable] = useState<boolean | 'checking'>(false);

  return (
    <FormTextField
      label="Name"
      placeholder="alisha"
      right={<TextInput.Affix text={CONFIG.ensSuffix} />}
      autoCapitalize="none"
      rules={{
        minLength: { value: 4, message: 'Too short' },
        maxLength: { value: 40, message: 'Too long' },
        pattern: {
          value: /^[0-9a-zA-Z$-]{4,40}$/,
          message: 'Must contain only alpha-numeric characters and: $ -',
        },
        validate: async (label) => {
          setAvailable('checking');
          const available = !!(await api.query(LabelAvailable, { label })).data?.labelAvailable;
          setAvailable(available);
          return available || 'Not available';
        },
      }}
      {...(isAvailable === true && {
        activeOutlineColor: styles.available.color,
        outlineColor: styles.available.color,
        supporting: 'Available',
        supportingStyle: styles.available,
      })}
      {...(isAvailable === 'checking' && {
        supporting: 'Checking availability...',
      })}
      {...props}
    />
  );
}

const useStyles = makeStyles(({ colors }) => ({
  available: {
    color: colors.success,
  },
}));
