import { useEffect, useRef } from 'react';
import { GestureResponderEvent } from 'react-native';
import { FieldValues, useFormState, UseFormStateProps } from 'react-hook-form';

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
  onPress: onPressProp,
  ...props
}: FormSubmitButtonProps<TFieldValues>) {
  const { isValid, isSubmitting, isSubmitted, isDirty } = useFormState({ control });

  const disabled =
    isSubmitting || (isSubmitted && !isValid) || (requireChanges && !isDirty) || props.disabled;

  const expectOnPress = useRef(false);
  useEffect(() => {
    if (isSubmitted && expectOnPress.current) onPressProp?.();
  }, [isSubmitted, onPressProp]);

  return (
    <Button
      {...props}
      disabled={disabled}
      loading={isSubmitting}
      {...(onPressProp && {
        onPointerDown: () => (expectOnPress.current = true),
        onPress: (e) => {
          expectOnPress.current = false;
          onPressProp?.(e);
        },
      })}
    />
  );
}
