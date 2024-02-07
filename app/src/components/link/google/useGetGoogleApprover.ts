import { err, ok, safeTry } from 'neverthrow';
import { useGetGoogleAccessToken } from './useGetGoogleAccessToken';
import { useGetCloudApprover } from '~/hooks/cloud/useGetCloudApprover';
import { signInWithGoogle, isCurrentToken } from './useSignInWithGoogle';

export function useGetGoogleApprover() {
  const getCloudApprover = useGetCloudApprover();
  const getAccessToken = useGetGoogleAccessToken();

  return (subject?: string) =>
    safeTry(async function* () {
      const user = yield* (await signInWithGoogle(subject)).safeUnwrap();

      if (subject && user.id !== subject) return err('wrong-account' as const);
      if (!isCurrentToken(user.idToken)) return err('expired' as const);

      console.log({ user });
      const accessToken = yield* (await getAccessToken(user.id)).safeUnwrap();
      console.log({ accessToken });
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
