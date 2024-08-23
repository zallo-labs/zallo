import { useApproverWallet } from '~/lib/network/useApprover';
import { ok, err } from 'neverthrow';
import { useMemo } from 'react';
import { useAuthenticate } from '~/app/auth';
import { showError } from '#/Snackbar';
import { useAuthSettings } from '#/auth/AuthSettings';

export function useSignWithApprover() {
  const approver = useApproverWallet();
  const auth = useAuthenticate();
  const { approval: authRequired } = useAuthSettings();

  return useMemo(() => {
    const check = async () => {
      if (authRequired && !(await auth())) {
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
  }, [approver, authRequired, auth]);
}
