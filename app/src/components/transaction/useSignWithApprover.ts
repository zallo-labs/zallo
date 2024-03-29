import { useApproverWallet } from '~/lib/network/useApprover';
import { ok, err } from 'neverthrow';
import { useMemo } from 'react';
import { useAuthenticate } from '~/app/(modal)/auth';
import { showError } from '#/provider/SnackbarProvider';
import { useAuthRequiredOnApproval } from '#/shared/AuthSettings';

export function useSignWithApprover() {
  const approver = useApproverWallet();
  const authenticate = useAuthenticate();
  const authRequired = useAuthRequiredOnApproval();

  return useMemo(() => {
    const check = async () => {
      if (authRequired && !(await authenticate())) {
        showError('Authentication is required for approval');
        return err('authentication-refused' as const);
      }
      return ok(undefined);
    };

    return {
      signTypedData: async (...params: Parameters<typeof approver.signTypedData>) =>
        (await check()).asyncMap(async () => approver.signTypedData(...params)),
      signMessage: async (...params: Parameters<typeof approver.signMessage>) =>
        (await check()).asyncMap(async () => approver.signMessage(...params)),
    };
  }, [approver, authRequired, authenticate]);
}
