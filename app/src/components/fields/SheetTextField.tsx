import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import { TextField, TextFieldProps } from './TextField';

export const SheetTextField = ({
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) => {
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

  const handleOnFocus: TextFieldProps['onFocus'] = useCallback(
    (args) => {
      shouldHandleKeyboardEvents.value = true;
      onFocus?.(args);
    },
    [onFocus, shouldHandleKeyboardEvents],
  );
  const handleOnBlur: TextFieldProps['onBlur'] = useCallback(
    (args) => {
      shouldHandleKeyboardEvents.value = false;
      onBlur?.(args);
    },
    [onBlur, shouldHandleKeyboardEvents],
  );

  return <TextField {...props} onFocus={handleOnFocus} onBlur={handleOnBlur} />;
};
