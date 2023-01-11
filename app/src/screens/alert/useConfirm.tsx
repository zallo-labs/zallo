import { useTheme } from '@theme/paper';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { AlertScreenParams } from './AlertScreen';

type ConfirmFunction<Defaults extends Partial<ConfirmOptions>> = (
  overrides: Defaults extends ConfirmOptions ? Partial<ConfirmOptions> : ConfirmOptions,
) => void;

export interface ConfirmOptions extends AlertScreenParams {
  enabled?: boolean;
}

export const useConfirm = <Defaults extends Partial<ConfirmOptions>>(
  defaults?: Defaults,
): ConfirmFunction<Defaults> => {
  const { navigate } = useRootNavigation();

  return useCallback(
    (overrides) => {
      const { enabled = true, ...params } = { ...defaults, ...overrides };

      return enabled ? navigate('Alert', params) : params.onConfirm();
    },
    [defaults, navigate],
  );
};

export const useConfirmDelete = <Defaults extends Partial<ConfirmOptions>>(defaults?: Defaults) =>
  useConfirm({
    title: 'Delete?',
    message: 'Are you sure you want to delete?',
    confirmLabel: 'Delete',
    confirmTextColor: useTheme().colors.error,
    ...defaults,
  }) as ConfirmFunction<Defaults>;

export const useConfirmDiscard = <Defaults extends Partial<ConfirmOptions>>(defaults?: Defaults) =>
  useConfirm({
    title: 'Discard changes?',
    message: 'You have unsaved changes. Do you want to discard them?',
    confirmLabel: 'Discard',
    confirmTextColor: useTheme().colors.error,
    ...defaults,
  }) as ConfirmFunction<Defaults>;
