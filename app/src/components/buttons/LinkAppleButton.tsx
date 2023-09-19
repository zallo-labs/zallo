import { gql } from '@api';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { authContext } from '@api/client';
import { isPresent } from 'lib';
import { makeStyles } from '@theme/makeStyles';
import AppleIconSvg from '../../../assets/apple.svg';
import { Fab } from './Fab';
import { useGetAppleApprover } from '~/util/useGetAppleApprover';
import { showError } from '~/provider/SnackbarProvider';

const Query = gql(/* GraphQL */ `
  query LinkAppleButton {
    user {
      id
      name
      linkingToken
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

const Link = gql(/* GraphQL */ `
  mutation LinkAppleButton_Link($token: String!) {
    link(input: { token: $token }) {
      id
      name
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
  const styles = useStyles();
  const getApprover = useGetAppleApprover();
  const updateUser = useMutation(UpdateUser)[1];
  const link = useMutation(Link)[1];

  const { user } = useQuery(Query).data;

  if (!getApprover) return null;

  return (
    <Fab
      position="relative"
      icon={({ size }) => (
        <AppleIconSvg fill={styles.icon.color} style={{ aspectRatio: 1, width: size }} />
      )}
      color={styles.icon.color}
      style={styles.container}
      onPress={async () => {
        const r = await getApprover({});
        if (r.isErr())
          return showError('Something went wrong, failed to link Apple account', {
            event: { error: r.error },
          });

        const {
          approver,
          credentials: { fullName },
        } = r.value;

        await link({ token: user.linkingToken }, await authContext(approver));

        const name = [fullName?.givenName, fullName?.familyName].filter(isPresent).join(' ');

        if (!user.name && name) await updateUser({ input: { name } });

        await onLink?.();
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
