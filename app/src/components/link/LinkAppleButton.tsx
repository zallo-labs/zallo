import { createStyles, useStyles } from '@theme/styles';
import { useLinkApple } from '#/cloud/useLinkApple';
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from 'expo-apple-authentication';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { LinkAppleButton_user$key } from '~/api/__generated__/LinkAppleButton_user.graphql';

const User = graphql`
  fragment LinkAppleButton_user on User {
    id
    ...useLinkApple_user
  }
`;

export interface LinkAppleButtonProps {
  user: LinkAppleButton_user$key;
  onLink?: () => void | Promise<void>;
}

export function LinkAppleButton({ onLink, ...props }: LinkAppleButtonProps) {
  const { styles, theme } = useStyles(stylesheet);
  const user = useFragment(User, props.user);
  const link = useLinkApple({ user });

  if (!link) return null;

  return (
    <AppleAuthenticationButton
      buttonStyle={
        theme.dark ? AppleAuthenticationButtonStyle.WHITE : AppleAuthenticationButtonStyle.BLACK
      }
      buttonType={AppleAuthenticationButtonType.CONTINUE}
      cornerRadius={styles.buttonCorner.borderRadius}
      style={styles.button}
      onPress={async () => {
        if (await link()) await onLink?.();
      }}
    />
  );
}

const stylesheet = createStyles(({ corner }) => ({
  button: {
    height: 40,
  },
  buttonCorner: {
    borderRadius: corner.l,
  },
}));
