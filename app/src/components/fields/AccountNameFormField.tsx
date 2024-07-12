import { createStyles, useStyles } from '@theme/styles';
import { useState } from 'react';
import { FieldValues, FieldPath } from 'react-hook-form';
import { FormTextField, FormTextFieldProps } from '#/fields/FormTextField';
import { fetchQuery, graphql } from 'relay-runtime';
import { useRelayEnvironment } from 'react-relay';
import { AccountNameFormFieldQuery } from '~/api/__generated__/AccountNameFormFieldQuery.graphql';

const NameAvailable = graphql`
  query AccountNameFormFieldQuery($name: String!) {
    nameAvailable(name: $name)
  }
`;

export interface AccountNameFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends FormTextFieldProps<TFieldValues, TName> {}

export function AccountNameFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: AccountNameFormFieldProps<TFieldValues, TName>) {
  const { styles } = useStyles(stylesheet);
  const environment = useRelayEnvironment();

  const [isAvailable, setAvailable] = useState<boolean | 'checking'>(false);

  return (
    <FormTextField
      label="Name"
      placeholder="alisha"
      autoCapitalize="none"
      rules={{
        minLength: { value: 4, message: 'Too short' },
        maxLength: { value: 40, message: 'Too long' },
        pattern: {
          value: /^[0-9a-zA-Z$-]{4,40}$/,
          message: 'Must contain only alpha-numeric characters and: $ -',
        },
        validate: async (name) => {
          setAvailable('checking');

          const available = !!(
            await fetchQuery<AccountNameFormFieldQuery>(
              environment,
              NameAvailable,
              { name },
              { fetchPolicy: 'network-only' },
            ).toPromise()
          )?.nameAvailable;
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

const stylesheet = createStyles(({ colors }) => ({
  available: {
    color: colors.success,
  },
}));
