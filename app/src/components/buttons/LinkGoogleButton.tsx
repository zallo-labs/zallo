import { GoogleButton, GoogleSignInResult } from './GoogleButton';
import { gql } from '@api';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { authContext } from '@api/client';

const Query = gql(/* GraphQL */ `
  query SignInWithGoogleButton {
    user {
      id
      name
      photoUri
      pairingToken
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

const Pair = gql(/* GraphQL */ `
  mutation SignInWithGoogleButton_Pair($token: String!) {
    pair(input: { token: $token }) {
      id
      approvers {
        id
      }
    }
  }
`);

export interface LinkGoogleButtonProps {
  onLink?: (result: GoogleSignInResult) => void | Promise<void>;
  signOut?: boolean;
}

export function LinkGoogleButton({ onLink, signOut }: LinkGoogleButtonProps) {
  const updateUser = useMutation(UpdateUser)[1];
  const pair = useMutation(Pair)[1];

  const { user } = useQuery(Query).data;

  return (
    <GoogleButton
      signOut={signOut}
      onSignIn={async (result) => {
        const { user: googleUser, approver } = result;

        await pair({ token: user.pairingToken }, await authContext(approver));

        if (googleUser.name || googleUser.photo) {
          await updateUser({
            input: {
              ...(!user.name && googleUser.name && { name: googleUser.name }),
              ...(!user.photoUri && googleUser.photo && { photoUri: googleUser.photo }),
            },
          });
        }

        await onLink?.(result);
      }}
    />
  );
}
