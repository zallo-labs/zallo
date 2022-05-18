import { ComponentPropsWithoutRef, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { FAB, useTheme } from 'react-native-paper';
import { containsErrors } from './FormikErrors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type FormikSubmitFabProps = Omit<
  ComponentPropsWithoutRef<typeof FAB>,
  'icon'
> & {
  // FAB icon prop is untyped, but uses MaterialCommunityIcons
  icon: ComponentPropsWithoutRef<typeof MaterialCommunityIcons>['name'];
  hideWhenClean?: boolean;
};

export const FormikSubmitFab = ({
  hideWhenClean,
  ...props
}: FormikSubmitFabProps) => {
  const { submitForm, isSubmitting, dirty, errors } = useFormikContext();
  const { colors } = useTheme();

  const disabled = useMemo(
    () => dirty && (isSubmitting || containsErrors(errors)),
    [isSubmitting, dirty, errors],
  );

  if (hideWhenClean && !dirty) return null;

  return (
    <FAB
      onPress={submitForm}
      disabled={disabled}
      {...props}
      style={Object.assign(
        {
          ...(!disabled && { backgroundColor: colors.primary }),
        },
        props.style,
      )}
    />
  );
};
