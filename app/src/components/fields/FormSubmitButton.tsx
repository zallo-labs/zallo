import { useEffect, useRef } from 'react';
import { FieldValues, useFormState, UseFormStateProps } from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import { Button, ButtonProps } from '~/components/Button';

export interface FormSubmitButtonProps<TFieldValues extends FieldValues>
  extends Omit<ButtonProps, 'onPress'> {
  control?: UseFormStateProps<TFieldValues>['control'];
  requireChanges?: boolean;
  onPress?: (e?: GestureResponderEvent) => void;
}

export function FormSubmitButton<TFieldValues extends FieldValues>({
  requireChanges,
  control,
  ...props
}: FormSubmitButtonProps<TFieldValues>) {
  const { isValid, isSubmitting, isSubmitted, isDirty } = useFormState({ control });

  const disabled =
    isSubmitting || (isSubmitted && !isValid) || (requireChanges && !isDirty) || props.disabled;

  const expectOnPress = useRef(false);
  useEffect(() => {
    if (isSubmitted && expectOnPress.current) props.onPress?.();
  }, [isSubmitted]);

  return (
    <Button
      {...props}
      disabled={disabled}
      loading={isSubmitting}
      {...(props.onPress && {
        onPointerDown: () => (expectOnPress.current = true),
        onPress: (e) => {
          expectOnPress.current = false;
          props.onPress?.(e);
        },
      })}
    />
  );
}
