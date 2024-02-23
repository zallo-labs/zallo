import { FragmentType, gql, useFragment } from '@api';
import { createStyles, useStyles } from '@theme/styles';
import { Text } from 'react-native-paper';
import { TextProps } from '@theme/types';

const Message = gql(/* GraphQL */ `
  fragment MessageStatus_Message on Message {
    id
    signature
  }
`);

export interface MessageStatusProps extends Omit<TextProps, 'children'> {
  proposal: FragmentType<typeof Message>;
}

export function MessageStatus(props: MessageStatusProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Message, props.proposal);

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
