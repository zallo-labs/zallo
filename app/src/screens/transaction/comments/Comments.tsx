import { Box } from '@components/Box';
import { TextField } from '@components/fields/TextField';
import { makeStyles } from '@util/theme/makeStyles';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { useCreateComment } from '~/mutations/comment/useCreateComment.api';
import { Tx } from '~/queries/tx';
import { Comment, useComments } from '~/queries/useComments.api';
import { CommentCard } from './CommentCard';

export interface CommentsProps extends Partial<FlatListProps<Comment>> {
  tx: Tx;
}

export const Comments = ({ tx, ...listProps }: CommentsProps) => {
  const styles = useStyles();
  const { comments: unsortedComments } = useComments(tx);
  const createComment = useCreateComment(tx);

  // Display comments newer -> older
  const comments = useMemo(
    () => [...unsortedComments].reverse(),
    [unsortedComments],
  );

  const [comment, setComment] = useState('');
  const handleComment = useCallback(() => {
    if (comment) {
      setComment('');
      createComment(comment);
    }
  }, [comment, createComment]);

  return (
    <>
      <FlatList
        data={comments}
        renderItem={({ item, index }) => (
          <CommentCard
            comment={item}
            // Don't show the author's name if the comment above is from the same author
            name={index === 0 || comments[index - 1].author !== item.author}
          />
        )}
        ItemSeparatorComponent={() => <Box my={1} />}
        style={styles.list}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        {...listProps}
      />

      <TextField
        label="Comment"
        value={comment}
        onChangeText={setComment}
        style={styles.input}
        onSubmitEditing={handleComment}
      />
    </>
  );
};

const useStyles = makeStyles(({ space }) => ({
  list: {
    flex: 1,
  },
  input: {
    marginHorizontal: space(2),
    marginBottom: space(2),
  },
}));
