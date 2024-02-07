import { FragmentType, gql, useFragment } from '@api';
import { UseLinkGoogleProps, useLinkGoogle } from '~/components/link/google/useLinkGoogle';
import { Fab } from '~/components/Fab';
import { GoogleIcon } from '@theme/icons';
import {
  GoogleSigninButton,
  WebGoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import { CONFIG } from '~/util/config';
import { Platform } from 'react-native';
import { Button } from '~/components/Button';
import { createStyles } from '@theme/styles';
import { PropsWithChildren } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const User = gql(/* GraphQL */ `
  fragment LinkGoogleButton_User on User {
    id
    ...useLinkGoogle_User
  }
`);

export interface LinkGoogleButtonProps extends Pick<UseLinkGoogleProps, 'signOut'> {
  user: FragmentType<typeof User>;
  onLink?: () => void | Promise<void>;
}

export function LinkGoogleButton({ user, onLink, ...params }: LinkGoogleButtonProps) {
  const link = useLinkGoogle({
    user: useFragment(User, user),
    ...params,
  });

  if (!link) return null;

  const handlePress = async () => {
    if (await link()) await onLink?.();
  };

  return (
    <Button
      mode="outlined"
      icon={({ size }) => <GoogleIcon size={size} />}
      style={styles.button}
      labelStyle={styles.label}
      onPress={handlePress}
    >
      Continue with Google
    </Button>
  );

  // return Platform.OS === 'web' ? (
  //   <WebGoogleSigninButton
  //     webClientId={CONFIG.googleOAuth.webClient}
  //     onPress={handlePress}
  //     onError={(e) => {
  //       console.error(e);
  //     }}
  //     size="large"
  //     shape="pill"
  //     text="continue_with"
  //   />
  // ) : (
  //   <GoogleSigninButton onPress={handlePress} />
  // );

  // return (
  //   <Fab
  //     position="relative"
  //     icon={(iconProps) => <GoogleIcon style={styles.icon(iconProps.size)} />}
  //     style={styles.container}
  //     onPress={async () => {
  //       if (await link()) await onLink?.();
  //     }}
  //   />
  // );
}

const styles = createStyles({
  container: {
    backgroundColor: 'white',
  },
  icon: (size: number) => ({
    aspectRatio: 1,
    height: size,
  }),
  button: {
    backgroundColor: 'white',
  },
  label: {
    color: 'black',
  },
});
