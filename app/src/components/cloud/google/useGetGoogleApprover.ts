import { ok, safeTry } from 'neverthrow';
import { useGetCloudApprover } from '~/hooks/cloud/useGetCloudApprover';
import { useSignInWithGoogle } from './useSignInWithGoogle';

export function useGetGoogleApprover() {
  const signIn = useSignInWithGoogle();
  const getCloudApprover = useGetCloudApprover();

  return (subject?: string) =>
    safeTry(async function* () {
      const { accessToken } = yield* (await signIn(subject)).safeUnwrap();

      const approver = yield* (
        await getCloudApprover({
          accessToken,
          details: !subject
            ? await (async () => {
                const u = (await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }).then((res) => res.json())) as {
                  sub: string;
                  email: string;
                  name: string;
                  picture?: string;
                };

                return {
                  name: `${u.email} (Google)`,
                  cloud: { provider: 'Google', subject: u.sub },
                };
              })()
            : undefined,
        })
      ).safeUnwrap();

      return ok(approver);
    });
}
