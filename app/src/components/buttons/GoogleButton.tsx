import { ImageRequireSource } from 'react-native';
import { Image } from 'expo-image';
import { makeStyles } from '@theme/makeStyles';
import {
  GoogleSignin,
  ConfigureParams as GoogleConfigureParams,
  NativeModuleError,
  statusCodes as ErrorCode,
  User as UserDetails,
} from '@react-native-google-signin/google-signin';
import { atom, useAtom } from 'jotai';
import { CONFIG } from '~/util/config';
import { ResultAsync } from 'neverthrow';
import { withSuspense } from '../skeleton/withSuspense';
import { Approver } from 'lib';
import { useGetCloudApprover } from '~/util/useGetCloudApprover';
import { Fab } from './Fab';

const GoogleIconSource: ImageRequireSource = require('assets/google.png');

const PARAMS = {
  scopes: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
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

const hasPlayServicesAtom = atom(() => GoogleSignin.hasPlayServices());
export const useHasPlayServices = () => useAtom(hasPlayServicesAtom);

export interface GoogleButtonProps {
  subject?: string;
  onSignIn: (result: GoogleSignInResult) => void | Promise<void>;
  signOut?: boolean;
}

export const GoogleButton = withSuspense(({ subject, onSignIn, signOut }: GoogleButtonProps) => {
  const styles = useStyles();
  const getCloudApprover = useGetCloudApprover();

  if (!useHasPlayServices()) return null;

  return (
    <Fab
      position="relative"
      icon={(props) => (
        <Image source={GoogleIconSource} style={{ aspectRatio: 1, height: props.size }} />
      )}
      style={styles.container}
      onPress={async () => {
        GoogleSignin.configure({ ...PARAMS, accountName: subject });

        if (signOut) GoogleSignin.signOut();

        const r = await ResultAsync.fromPromise(
          GoogleSignin.signInSilently(),
          () => undefined,
        ).orElse(() =>
          ResultAsync.fromPromise(
            GoogleSignin.signIn({ loginHint: subject }),
            (e) => (e as NativeModuleError).message as keyof typeof ErrorCode | 'INVALID_ACCOUNT',
          ),
        );
        if (r.isErr()) return;

        const { idToken, accessToken } = await GoogleSignin.getTokens();
        const approver = await getCloudApprover({ idToken, accessToken });

        await onSignIn({ idToken, user: r.value.user, approver });
      }}
    />
  );
}, null);

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: 'white',
  },
}));
