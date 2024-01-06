import { CONFIRMATIONS, ConfirmModalParams } from '~/app/confirm';
import { useGetEvent } from '~/hooks/useGetEvent';

export function useConfirm(defaults?: Partial<ConfirmModalParams>) {
  const getEvent = useGetEvent();

  return (params?: Partial<ConfirmModalParams>) =>
    getEvent({ pathname: `/confirm`, params: { ...defaults, ...params } }, CONFIRMATIONS);
}

export function useConfirmRemoval<Defaults extends Partial<ConfirmModalParams>>(
  defaults?: Defaults,
) {
  return useConfirm({
    title: 'Remove?',
    message: 'Are you sure you want to remove?',
    confirmLabel: 'Remove',
    type: 'destructive',
    ...defaults,
  });
}
