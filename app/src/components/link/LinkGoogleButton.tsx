import { gql } from '@api';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { authContext } from '@api/client';
import { ImageRequireSource, StyleSheet } from 'react-native';
import { Fab } from '~/components/Fab';
import { Image } from 'expo-image';
import { useGetGoogleApprover } from '~/hooks/cloud/useGetGoogleApprover';
import { showError } from '~/components/provider/SnackbarProvider';

const Query = gql(/* GraphQL */ `
  query SignInWithGoogleButton {
    user {
      id
      name
      photoUri
      linkingToken
    }
  }
`);

const UpdateUser = gql(/* GraphQL */ `
  mutation SignInWithGoogleButton_UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      photoUri
    }
  }
`);

const Link = gql(/* GraphQL */ `
  mutation SignInWithGoogleButton_Link($token: String!) {
    link(input: { token: $token }) {
      id
      name
      approvers {
        id
      }
    }
  }
`);

const GoogleIconSource: ImageRequireSource = require('assets/google.png');

export interface LinkGoogleButtonProps {
  onLink?: () => void | Promise<void>;
  signOut?: boolean;
}

export function LinkGoogleButton({ onLink, signOut }: LinkGoogleButtonProps) {
  const getApprover = useGetGoogleApprover();
  const updateUser = useMutation(UpdateUser)[1];
  const link = useMutation(Link)[1];

  const { user } = useQuery(Query).data;

  if (!getApprover) return null;

  return (
    <Fab
      position="relative"
      icon={(iconProps) => (
        <Image source={GoogleIconSource} style={{ aspectRatio: 1, height: iconProps.size }} />
      )}
      style={styles.container}
      onPress={async () => {
        const r = await getApprover({ signOut });
        if (r.isErr())
          return showError('Something went wrong, failed to link Google account', {
            event: { error: r.error },
          });

        const {
          user: { name, photo },
          approver,
        } = r.value;

        await link({ token: user.linkingToken }, await authContext(approver));

        if (name || photo) {
          await updateUser({
            input: {
              ...(!user.name && name && { name }),
              ...(!user.photoUri && photo && { photoUri: photo }),
            },
          });
        }

        await onLink?.();
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
});
