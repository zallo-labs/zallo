import {
  GoogleSignin,
  ConfigureParams as GoogleConfigureParams,
  statusCodes as ErrorCode,
  User as UserDetails,
} from '@react-native-google-signin/google-signin';
import { atom, useAtom } from 'jotai';
import { CONFIG } from '~/util/config';
import { Result, ResultAsync, err, okAsync } from 'neverthrow';
import { Approver } from 'lib';
import { useGetCloudApprover } from '~/util/useGetCloudApprover';
import { showError } from '~/provider/SnackbarProvider';
import { clog } from './format';
import decodeJwt from 'jwt-decode';
import { DateTime } from 'luxon';

const PARAMS = {
  scopes: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.appdata',
  ],
  profileImageSize: 120,
  webClientId: CONFIG.googleOAuth.webClient,
  iosClientId: CONFIG.googleOAuth.iosClient,
} as GoogleConfigureParams;

export interface GoogleSignInResult {
  idToken: string;
  user: UserDetails['user'];
  approver: Approver;
}

type GoogleSignInError = keyof typeof ErrorCode | 'INVALID_ACCOUNT' | 'WRONG_ACCOUNT';

const hasPlayServicesAtom = atom(() => GoogleSignin.hasPlayServices());
export const useHasPlayServices = () => useAtom(hasPlayServicesAtom);

export interface GetGoogleApproverParams {
  subject?: string;
  signOut?: boolean;
}

export function useGetGoogleApprover() {
  const getCloudApprover = useGetCloudApprover();

  if (!useHasPlayServices()) return null;

  const signIn = async ({
    subject,
    signOut,
  }: GetGoogleApproverParams): Promise<Result<UserDetails, GoogleSignInError>> => {
    GoogleSignin.configure({ ...PARAMS });

    if (signOut) await GoogleSignin.signOut();

    return ResultAsync.fromPromise(
      (async () => {
        const details =
          (await GoogleSignin.getCurrentUser()) ?? (await GoogleSignin.signInSilently());

        if (subject && details.user.id !== subject) throw new Error('Wrong account');

        if (!details.idToken) throw new Error('idToken missing');

        const decoded = decodeJwt(details.idToken);
        if (
          typeof decoded === 'object' &&
          decoded !== null &&
          'exp' in decoded &&
          typeof decoded.exp === 'number' &&
          DateTime.fromSeconds(decoded.exp) <= DateTime.now()
        ) {
          throw new Error('Expired');
        }

        return details;
      })(),
      () => undefined,
    )
      .orElse(() =>
        ResultAsync.fromPromise(
          GoogleSignin.signIn(),
          (e) => (e as Error).message as keyof typeof ErrorCode | 'INVALID_ACCOUNT',
        ),
      )
      .andThen((details) => {
        clog({ details, subject });
        if (!subject || details.user.id === subject) return okAsync(details);

        return new ResultAsync(
          new Promise<Result<UserDetails, GoogleSignInError>>((resolve) => {
            const timeout = setTimeout(() => resolve(err('WRONG_ACCOUNT' as const)), 20000);

            showError('Wrong Google account', {
              action: {
                label: 'Retry',
                onPress: () => {
                  clearTimeout(timeout);
                  signIn({ subject, signOut }).then((v) => resolve(v));
                },
              },
            });
          }),
        );
      });
  };

  return async ({ subject, signOut }: GetGoogleApproverParams) =>
    new ResultAsync(signIn({ subject, signOut })).map(async (details) => {
      const { idToken, accessToken } = await GoogleSignin.getTokens();
      const approver = await getCloudApprover({
        idToken,
        accessToken,
        create: { name: 'Google account' },
      });

      return { idToken, user: details.user, approver };
    });
}
