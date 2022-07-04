import { Box } from '@components/Box';
import { Commentable, useComments } from '~/queries/useComments';
import { CreateCommentField } from './CreateCommentField';
import { CommentItem } from './CommentItem';

export interface CommentsProps {
  commentable: Commentable;
}

export const Comments = ({ commentable }: CommentsProps) => {
  const { comments } = useComments(commentable);

  return (
    <Box>
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} px={3} my={2} />
      ))}

      <Box mx={3}>
        <CreateCommentField commentable={commentable} />
      </Box>
    </Box>
  );
};
