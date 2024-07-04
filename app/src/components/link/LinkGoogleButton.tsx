import { GoogleIcon } from '@theme/icons';
import { UseLinkGoogleProps, useLinkGoogle } from '#/cloud/google/useLinkGoogle';
import { createStyles } from '@theme/styles';
import { Button } from '#/Button';
import { graphql } from 'relay-runtime';
import { LinkGoogleButton_user$key } from '~/api/__generated__/LinkGoogleButton_user.graphql';
import { useFragment } from 'react-relay';

const User = graphql`
  fragment LinkGoogleButton_user on User {
    id
    ...useLinkGoogle_user
  }
`;

export interface LinkGoogleButtonProps extends Omit<UseLinkGoogleProps, 'user'> {
  user: LinkGoogleButton_user$key;
  onLink?: () => void | Promise<void>;
}

export function LinkGoogleButton({ user, onLink, ...params }: LinkGoogleButtonProps) {
  const link = useLinkGoogle({ user: useFragment(User, user), ...params });

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
}

const styles = createStyles({
  container: {
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: 'white',
  },
  label: {
    color: 'black',
  },
});
