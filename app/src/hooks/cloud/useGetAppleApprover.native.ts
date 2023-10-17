import { useGetCloudApprover } from './useGetCloudApprover';
import * as Auth from 'expo-apple-authentication';
import { atom, useAtomValue } from 'jotai';
import { Result, ResultAsync, err, okAsync } from 'neverthrow';
import { CodedError } from 'expo-modules-core';
import { showError } from '~/components/provider/SnackbarProvider';

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
      (e) => e as CodedError,
    ).andThen((credentials) =>
      !subject || subject === credentials.user
        ? okAsync(credentials)
        : new ResultAsync(
            new Promise<Result<Auth.AppleAuthenticationCredential, CodedError | 'WRONG_ACCOUNT'>>(
              (resolve) => {
                const timeout = setTimeout(() => resolve(err('WRONG_ACCOUNT' as const)), 20000);

                showError('Wrong Apple account', {
                  action: {
                    label: 'Retry',
                    onPress: () => {
                      clearTimeout(timeout);
                      signIn({ subject }).then((v) => resolve(v));
                    },
                  },
                });
              },
            ),
          ),
    );

  return async ({ subject }: GetAppleApproverParams) => {
    return new ResultAsync(signIn({ subject })).andThen((credentials) =>
      new ResultAsync(
        getCloudApprover({
          idToken: credentials.identityToken!,
          accessToken: null,
          create: { name: 'Apple account' },
        }),
      ).map((approver) => ({
        credentials,
        approver,
      })),
    );
  };
}
