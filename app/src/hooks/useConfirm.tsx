import { useGetEvent } from '~/hooks/useGetEvent';
import { CONFIRMATIONS, ConfirmModalParams } from '~/app/confirm';

export function useConfirm(defaults?: Partial<ConfirmModalParams>) {
  const getEvent = useGetEvent();

  return (params?: Partial<ConfirmModalParams>) =>
    getEvent({ pathname: `/confirm`, params: { ...defaults, ...params } }, CONFIRMATIONS);
}

export function useConfirmDelete<Defaults extends Partial<ConfirmModalParams>>(
  defaults?: Defaults,
) {
  return useConfirm({
    title: 'Delete?',
    message: 'Are you sure you want to delete?',
    confirmLabel: 'Delete',
    destructive: 'yes',
    ...defaults,
  });
}

export function useConfirmRemoval<Defaults extends Partial<ConfirmModalParams>>(
  defaults?: Defaults,
) {
  return useConfirm({
    title: 'Remove?',
    message: 'Are you sure you want to remove?',
    confirmLabel: 'Remove',
    destructive: 'yes',
    ...defaults,
  });
}

export function useConfirmDiscard<Defaults extends Partial<ConfirmModalParams>>(
  defaults?: Defaults,
) {
  return useConfirm({
    title: 'Discard changes?',
    message: 'You have unsaved changes. Do you want to discard them?',
    confirmLabel: 'Discard',
    destructive: 'yes',
    ...defaults,
  });
}
