import { gql } from '@api';
import { AppleButton } from './AppleButton';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { authContext } from '@api/client';
import { isPresent } from 'lib';
import { clog } from '~/util/format';

const Query = gql(/* GraphQL */ `
  query LinkAppleButton {
    user {
      id
      name
      pairingToken
    }
  }
`);

const UpdateUser = gql(/* GraphQL */ `
  mutation LinkAppleButton_UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
    }
  }
`);

const Pair = gql(/* GraphQL */ `
  mutation LinkAppleButton_Pair($token: String!) {
    pair(input: { token: $token }) {
      id
      approvers {
        id
      }
    }
  }
`);

export interface LinkAppleButtonProps {
  onLink?: () => void | Promise<void>;
}

export function LinkAppleButton({ onLink }: LinkAppleButtonProps) {
  const updateUser = useMutation(UpdateUser)[1];
  const pair = useMutation(Pair)[1];

  const { user } = useQuery(Query).data;

  return (
    <AppleButton
      onSignIn={async ({ approver, credentials: { fullName, ...creds } }) => {
        await pair({ token: user.pairingToken }, await authContext(approver));

        const name = [fullName?.givenName, fullName?.familyName].filter(isPresent).join(' ');

        if (!user.name && name) await updateUser({ input: { name } });

        await onLink?.();
      }}
    />
  );
}
