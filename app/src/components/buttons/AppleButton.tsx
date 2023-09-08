import { makeStyles } from '@theme/makeStyles';
import AppleIconSvg from '../../../assets/apple.svg';
import { Fab } from './Fab';
import * as Auth from 'expo-apple-authentication';
import { atom, useAtom } from 'jotai';
import { ResultAsync } from 'neverthrow';
import { CodedError } from 'expo-modules-core';
import { useGetCloudApprover } from '~/util/useGetCloudApprover';
import { logError } from '~/util/analytics';
import { Approver } from 'lib';

const isAvailable = atom(Auth.isAvailableAsync);

export interface AppleSignInResult {
  idToken: string;
  credentials: Auth.AppleAuthenticationCredential;
  approver: Approver;
}

export interface AppleButtonProps {
  subject?: string;
  onSignIn: (result: AppleSignInResult) => void | Promise<void>;
}

export function AppleButton({ subject, onSignIn }: AppleButtonProps) {
  const styles = useStyles();
  const getCloudApprover = useGetCloudApprover();

  if (!useAtom(isAvailable)) return null;

  return (
    <Fab
      position="relative"
      icon={({ size }) => (
        <AppleIconSvg fill={styles.icon.color} style={{ aspectRatio: 1, width: size }} />
      )}
      color={styles.icon.color}
      style={styles.container}
      onPress={async () => {
        const r = await ResultAsync.fromPromise(
          Auth.signInAsync({ requestedScopes: [Auth.AppleAuthenticationScope.FULL_NAME] }),
          (e) => e as CodedError,
        );
        if (r.isErr()) return;

        const idToken = r.value.identityToken;
        if (!idToken) return logError(`Expected Apple idToken`);

        const approver = await getCloudApprover({ idToken, accessToken: null });

        await onSignIn({ idToken, credentials: r.value, approver });
      }}
    />
  );
}

const useStyles = makeStyles(({ dark }) => ({
  container: {
    backgroundColor: dark ? 'white' : 'black',
  },
  icon: {
    color: dark ? 'black' : 'white',
  },
}));
