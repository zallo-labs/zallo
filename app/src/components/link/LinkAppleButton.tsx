import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { useGetAppleApprover } from '~/hooks/cloud/useGetAppleApprover';
import { showError } from '~/components/provider/SnackbarProvider';
import { gql } from '@api';
import { authContext } from '@api/client';
import { Fab } from '~/components/Fab';
import { AppleIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';

const Query = gql(/* GraphQL */ `
  query LinkAppleButton {
    user {
      id
      linkingToken
    }
  }
`);

const Link = gql(/* GraphQL */ `
  mutation LinkAppleButton_Link($token: String!) {
    link(input: { token: $token }) {
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
  const { styles } = useStyles(stylesheet);
  const getApprover = useGetAppleApprover();
  const link = useMutation(Link)[1];

  const { user } = useQuery(Query).data;

  if (!getApprover) return null;

  return (
    <Fab
      position="relative"
      icon={AppleIcon}
      color={styles.icon.color}
      style={styles.container}
      onPress={async () => {
        const r = await getApprover({});
        if (r.isErr())
          return showError('Something went wrong, failed to link Apple account', {
            event: { error: r.error },
          });

        const { approver } = r.value;
        await link({ token: user.linkingToken }, await authContext(approver));

        await onLink?.();
      }}
    />
  );
}

const stylesheet = createStyles(({ dark }) => ({
  container: {
    backgroundColor: dark ? 'white' : 'black',
  },
  icon: {
    color: dark ? 'black' : 'white',
  },
}));
