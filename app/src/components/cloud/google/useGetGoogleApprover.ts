import { ok, safeTry } from 'neverthrow';
import { useGetGoogleAccessToken } from './useGetGoogleAccessToken';
import { useGetCloudApprover } from '~/hooks/cloud/useGetCloudApprover';
import { signInWithGoogle } from './useSignInWithGoogle';

export function useGetGoogleApprover() {
  const getCloudApprover = useGetCloudApprover();
  const getAccessToken = useGetGoogleAccessToken();

  return (subject?: string) =>
    safeTry(async function* () {
      const user = yield* (await signInWithGoogle(subject)).safeUnwrap();
      const accessToken = yield* (await getAccessToken(user.id)).safeUnwrap();

      const approver = yield* (
        await getCloudApprover({
          idToken: user.idToken,
          accessToken,
          create: { name: user.email ? `${user.email} (Google)` : 'Google account' },
        })
      ).safeUnwrap();

      return ok({ ...user, approver });
    });
}
