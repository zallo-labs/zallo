import {
  GoogleOneTapSignIn,
  statusCodes as ErrorCode,
  isErrorWithCode,
  GoogleSignin,
  NativeModuleError,
} from '@react-native-google-signin/google-signin';
import { CONFIG } from '~/util/config';
import { errAsync, fromPromise, ok, safeTry } from 'neverthrow';
import { jwtDecode } from 'jwt-decode';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { logError } from '~/util/analytics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export function useSignInWithGoogle() {
  return useCallback(
    (subject?: string) =>
      safeTry(async function* () {
        const user = yield* signIn(subject).safeUnwrap();

        if (subject && user.id !== subject) return errAsync('wrong-account' as const);
        if (!isCurrentToken(user.idToken!)) return errAsync('expired' as const);

        console.log({ user });

        const accessToken = yield* getAccessToken().safeUnwrap();

        return ok({ accessToken });
      }),
    [],
  );
}

function signIn(subject?: string) {
  function oauthSignIn() {
    if (subject && GoogleSignin.getCurrentUser()?.user.id === subject)
      return GoogleSignin.signInSilently();

    return GoogleSignin.signIn({ ...(subject && { loginHint: subject }) });
  }

  return fromPromise(
    (async () => {
      const details = await (Platform.OS === 'android'
        ? (async () => {
            // One-tap sign-in
            const details = await GoogleOneTapSignIn.signIn({
              webClientId: CONFIG.googleOAuth.webClient,
              iosClientId: CONFIG.googleOAuth.iosClient,
              filterByAuthorizedAccounts: !!subject,
              autoSignIn: true,
            });

            // OAuth sign-in; required to get access token
            // This occurs instantly due to the one-tap sign-in
            await oauthSignIn();

            return details;
          })()
        : oauthSignIn());

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

function getAccessToken() {
  return fromPromise(
    GoogleSignin.getTokens().then((tokens) => tokens.accessToken),
    (e) => {
      logError('Failed to get Google access token', { error: e });
      return 'failed-to-get-access-token' as const;
    },
  );
}

function isCurrentToken(idToken: string) {
  const decoded = jwtDecode(idToken);

  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    'exp' in decoded &&
    typeof decoded.exp === 'number' &&
    DateTime.now() < DateTime.fromSeconds(decoded.exp)
  );
}
