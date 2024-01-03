import { FragmentType, gql, useFragment } from '@api';
import { DoubleCheckIcon, materialCommunityIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { match } from 'ts-pattern';

const ApprovalIcon = materialCommunityIcon('security');

const Message = gql(/* GraphQL */ `
  fragment MessageStatus_MessageProposal on MessageProposal {
    id
    signature
  }
`);

export interface MessageStatusProps {
  proposal: FragmentType<typeof Message>;
}

export function MessageStatus(props: MessageStatusProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Message, props.proposal);

  return (
    <View style={styles.container}>
      {match(!!p.signature)
        .with(false, () => (
          <>
            <ApprovalIcon style={styles.text} size={styles.icon.width} />
            <Text variant="headlineSmall" style={styles.text}>
              Awaiting approval
            </Text>
          </>
        ))
        .with(true, () => (
          <>
            <DoubleCheckIcon style={styles.text} size={styles.icon.width} />
            <Text variant="headlineSmall" style={styles.text}>
              Executed
            </Text>
          </>
        ))
        .exhaustive()}
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  icon: {
    width: 24,
  },
  text: {
    color: colors.tertiary,
  },
  failed: {
    color: colors.error,
  },
}));
