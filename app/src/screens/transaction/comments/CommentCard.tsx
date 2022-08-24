import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { useDevice } from '@network/useDevice';
import { makeStyles } from '~/util/theme/makeStyles';
import { Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { Comment } from '~/queries/useComments.api';

export interface CommentCardProps {
  comment: Comment;
  name?: boolean;
}

export const CommentCard = ({ comment, name = true }: CommentCardProps) => {
  const device = useDevice();
  const isAuthor = comment.author === device.address;
  const styles = useStyles(isAuthor);

  return (
    <Box horizontal {...(isAuthor && { justifyContent: 'flex-end' })}>
      <Card flexShrink={1} elevation={4} style={styles.card}>
        {name && !isAuthor && (
          <Text variant="titleMedium" style={[styles.text, styles.author]}>
            <Addr addr={comment.author} />
          </Text>
        )}

        <Text variant="bodyMedium" style={styles.text}>
          {comment.content}
        </Text>
      </Card>
    </Box>
  );
};

const useStyles = makeStyles(
  ({ space, colors, onBackground }, isAuthor: boolean) => {
    const backgroundColor = isAuthor ? colors.secondaryContainer : undefined;

    return {
      card: {
        ...(backgroundColor && { backgroundColor }),
      },
      text: {
        color: onBackground(backgroundColor),
      },
      author: {
        marginBottom: space(1),
      },
    };
  },
);
