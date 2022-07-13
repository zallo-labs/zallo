import { ComponentPropsWithoutRef, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { FAB, useTheme } from 'react-native-paper';
import { containsErrors } from './FormikErrors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const allTouched = (values: unknown, touched: Record<string, boolean>) =>
  typeof values === "object" && values !== null && Object.keys(values).every((field) => touched[field]);

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
  const { submitForm, isSubmitting, dirty, errors, touched, initialValues } =
    useFormikContext();
  const { colors } = useTheme();

  const disabled = useMemo(
    () =>
      isSubmitting ||
      (allTouched(initialValues, touched) && containsErrors(errors)),
    [isSubmitting, initialValues, touched, errors],
  );

  if (hideWhenClean && !dirty) return null;

  return (
    <FAB
      onPress={submitForm}
      disabled={disabled}
      {...props}
      style={[
        {
          ...(!disabled && { backgroundColor: colors.primary }),
        },
        props.style,
      ]}
    />
  );
};
