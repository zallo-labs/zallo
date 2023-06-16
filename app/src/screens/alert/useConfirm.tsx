import { useTheme } from '@theme/paper';
import { AlertModalParams, useAlert } from './AlertModal';

export const useConfirmDelete = <Defaults extends Partial<AlertModalParams>>(defaults?: Defaults) =>
  useAlert({
    title: 'Delete?',
    message: 'Are you sure you want to delete?',
    confirmLabel: 'Delete',
    confirmTextColor: useTheme().colors.error,
    ...defaults,
  });

export const useConfirmRemoval = <Defaults extends Partial<AlertModalParams>>(
  defaults?: Defaults,
) =>
  useAlert({
    title: 'Remove?',
    message: 'Are you sure you want to remove?',
    confirmLabel: 'Remove',
    confirmTextColor: useTheme().colors.error,
    ...defaults,
  });

export const useConfirmDiscard = <Defaults extends Partial<AlertModalParams>>(
  defaults?: Defaults,
) =>
  useAlert({
    title: 'Discard changes?',
    message: 'You have unsaved changes. Do you want to discard them?',
    confirmLabel: 'Discard',
    confirmTextColor: useTheme().colors.error,
    ...defaults,
  });
