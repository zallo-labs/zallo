import { Box } from '~/components/layout/Box';
import { TextField } from '~/components/fields/TextField';
import { makeStyles } from '~/util/theme/makeStyles';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { useCreateComment } from '~/mutations/comment/useCreateComment.api';
import { Comment, useComments } from '~/queries/useComments.api';
import { CommentCard } from './CommentCard';
import { useTxContext } from '../TransactionProvider';

export interface CommentsProps extends Partial<FlatListProps<Comment>> {}

export const Comments = (listProps: CommentsProps) => {
  const styles = useStyles();
  const { proposal: tx } = useTxContext();
  const [unsortedComments] = useComments(tx);
  const createComment = useCreateComment(tx, tx.account);

  // Display comments newer -> older
  const comments = useMemo(() => [...unsortedComments].reverse(), [unsortedComments]);

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
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        {...listProps}
      />

      <TextField
        label="Comment"
        value={comment}
        onChangeText={setComment}
        textStyle={styles.input}
        onSubmitEditing={handleComment}
        autoCorrect
      />
    </>
  );
};

const useStyles = makeStyles(({ space }) => ({
  list: {
    flex: 1,
  },
  input: {
    marginHorizontal: space(1),
    marginBottom: space(1),
  },
}));
