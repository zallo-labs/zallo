import { createStyles, useStyles } from '@theme/styles';
import { Text } from 'react-native-paper';
import { TextProps } from '@theme/types';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { MessageStatus_message$key } from '~/api/__generated__/MessageStatus_message.graphql';

const Message = graphql`
  fragment MessageStatus_message on Message {
    id
    signature
  }
`;

export interface MessageStatusProps extends Omit<TextProps, 'children'> {
  message: MessageStatus_message$key;
}

export function MessageStatus(props: MessageStatusProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Message, props.message);

  return !p.signature ? (
    <Text {...props} style={[props.style, styles.pending]}>
      Pending approval
    </Text>
  ) : (
    <Text {...props} style={[props.style, styles.signed]}>
      Signed
    </Text>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  pending: {
    color: colors.primary,
  },
  signed: {
    color: colors.success,
  },
}));
