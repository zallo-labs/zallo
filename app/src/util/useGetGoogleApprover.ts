import {
  GoogleSignin,
  ConfigureParams as GoogleConfigureParams,
  NativeModuleError,
  statusCodes as ErrorCode,
  User as UserDetails,
} from '@react-native-google-signin/google-signin';
import { atom, useAtom } from 'jotai';
import { CONFIG } from '~/util/config';
import { Result, ResultAsync, err, errAsync, ok, okAsync } from 'neverthrow';
import { Approver } from 'lib';
import { useGetCloudApprover } from '~/util/useGetCloudApprover';
import { showError } from '~/provider/SnackbarProvider';
import { clog } from './format';

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

  const login = async ({
    subject,
    signOut,
  }: GetGoogleApproverParams): Promise<Result<UserDetails, GoogleSignInError>> => {
    GoogleSignin.configure({ ...PARAMS });

    if (signOut) await GoogleSignin.signOut();

    return ResultAsync.fromPromise(
      (async () => {
        return (await GoogleSignin.getCurrentUser()) ?? (await GoogleSignin.signInSilently());
      })(),
      () => undefined,
    )
      .andThen((details) =>
        !subject || details.user.id === subject
          ? okAsync(details)
          : errAsync('SUBJECT_NOT_AVAILABLE' as const),
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
                  login({ subject, signOut }).then((v) => resolve(v));
                },
              },
            });
          }),
        );
      });
  };

  const get = async ({ subject, signOut }: GetGoogleApproverParams) =>
    new ResultAsync(login({ subject, signOut })).map(async (details) => {
      const { idToken, accessToken } = await GoogleSignin.getTokens();
      const approver = await getCloudApprover({ idToken, accessToken });

      return { idToken, user: details.user, approver };
    });

  return get;
}
