import { Fab } from '~/components/Fab';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { useLinkGoogle, UseLinkGoogleProps } from '~/hooks/cloud/useLinkGoogle';
import { GoogleIcon } from '~/util/theme/icons';
import { createStyles } from '~/util/theme/styles';

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

  return (
    <Fab
      position="relative"
      icon={(iconProps) => <GoogleIcon style={styles.icon(iconProps.size)} />}
      style={styles.container}
      onPress={async () => {
        if (await link()) await onLink?.();
      }}
    />
  );
}

const styles = createStyles({
  container: {
    backgroundColor: 'white',
  },
  icon: (size: number) => ({
    aspectRatio: 1,
    height: size,
  }),
});
