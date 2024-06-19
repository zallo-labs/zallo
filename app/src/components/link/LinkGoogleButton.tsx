import { FragmentType, gql, useFragment } from '@api';
import { GoogleIcon } from '@theme/icons';
import { UseLinkGoogleProps, useLinkGoogle } from '#/cloud/google/useLinkGoogle';
import { createStyles } from '@theme/styles';
import { Button } from '#/Button';

const User = gql(/* GraphQL */ `
  fragment LinkGoogleButton_User on User {
    id
    ...useLinkGoogle_User
  }
`);

export interface LinkGoogleButtonProps extends Omit<UseLinkGoogleProps, 'user'> {
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
