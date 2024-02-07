import {
  GoogleSignin,
  GoogleOneTapSignIn,
  statusCodes as ErrorCode,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import { CONFIG } from '~/util/config';
import { fromPromise } from 'neverthrow';
import { jwtDecode } from 'jwt-decode';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { logError } from '~/util/analytics';

export async function signInWithGoogle(subject?: string) {
  return fromPromise(
    (async () => {
      const details = await GoogleOneTapSignIn.signIn({
        webClientId: CONFIG.googleOAuth.webClient,
        iosClientId: CONFIG.googleOAuth.iosClient,
        filterByAuthorizedAccounts: !!subject,
        autoSignIn: true,
      });

      return { ...details.user, idToken: details.idToken };
    })(),
    (e) => {
      const knowError =
        isErrorWithCode(e) &&
        match(e.code)
          .with(ErrorCode.NO_SAVED_CREDENTIAL_FOUND, () => 'not-created' as const)
          .with(ErrorCode.SIGN_IN_CANCELLED, () => 'cancelled' as const)
          .with(ErrorCode.IN_PROGRESS, () => 'cancelled' as const)
          .with(ErrorCode.PLAY_SERVICES_NOT_AVAILABLE, () => 'unavailable' as const)
          .with(ErrorCode.ONE_TAP_START_FAILED, () => 'unavailable' as const)
          .otherwise(() => undefined);

      if (knowError) {
        console.error({ knowError, e });
        return knowError;
      } else {
        logError('Unhandled Google sign in error', { error: e });
        return 'unknown';
      }
    },
  );
}

export function isCurrentToken(idToken: string) {
  const decoded = jwtDecode(idToken);

  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    'exp' in decoded &&
    typeof decoded.exp === 'number' &&
    DateTime.now() < DateTime.fromSeconds(decoded.exp)
  );
}
