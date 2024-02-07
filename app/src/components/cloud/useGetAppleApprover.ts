import { useGetCloudApprover } from '../../hooks/cloud/useGetCloudApprover';
import * as Auth from 'expo-apple-authentication';
import { atom, useAtomValue } from 'jotai';
import { Result, ResultAsync, err, ok, okAsync, safeTry } from 'neverthrow';
import { CodedError } from 'expo-modules-core';
import { showError } from '#/provider/SnackbarProvider';

// https://docs.expo.dev/versions/latest/sdk/apple-authentication/#error-codes
type SignInError =
  | 'ERR_INVALID_OPERATION'
  | 'ERR_INVALID_RESPONSE'
  | 'ERR_INVALID_SCOPE'
  | 'ERR_REQUEST_CANCELED'
  | 'ERR_REQUEST_FAILED'
  | 'ERR_REQUEST_NOT_HANDLED'
  | 'ERR_REQUEST_NOT_INTERACTIVE'
  | 'ERR_REQUEST_UNKNOWN';

const isAvailableAtom = atom(Auth.isAvailableAsync);

export interface GetAppleApproverParams {
  subject?: string;
}

export function useGetAppleApprover() {
  const getCloudApprover = useGetCloudApprover();

  if (!useAtomValue(isAvailableAtom)) return null;

  const signIn = async ({ subject }: GetAppleApproverParams) =>
    ResultAsync.fromPromise(
      Auth.signInAsync({ requestedScopes: [Auth.AppleAuthenticationScope.FULL_NAME] }),
      (e) => (e as CodedError).code as SignInError,
    ).andThen((credentials) => {
      if (subject && credentials.user !== subject) return err('WRONG_ACCOUNT' as const);

      return okAsync(credentials);
    });

  return ({ subject }: GetAppleApproverParams) =>
    safeTry(async function* () {
      const credentials = yield* (await signIn({ subject })).safeUnwrap();

      const approver = yield* (
        await getCloudApprover({
          idToken: credentials.identityToken!,
          accessToken: null,
          create: { name: credentials.email ? `${credentials.email} (Apple)` : 'Apple account' },
        })
      ).safeUnwrap();

      return ok({ credentials, approver });
    });
}
