import { useMemo } from 'react';
import { err, ok } from 'neverthrow';

import { useAuthenticate } from '~/app/auth';
import { showError } from '~/components/provider/SnackbarProvider';
import { useAuthRequiredOnApproval } from '~/components/shared/AuthSettings';
import { useApproverWallet } from '~/lib/network/useApprover';

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
