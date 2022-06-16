import { Accordion, AccordionProps } from '@components/Accordion';
import { Box } from '@components/Box';
import { SECONDARY_ICON_SIZE } from '@components/list/Item';
import { MaterialIcons } from '@expo/vector-icons';
import { Commentable, useComments } from '~/queries/useComments';
import { CreateCommentField } from './CreateCommentField';
import { CommentItem } from './CommentItem';

export interface CommentsAccordionProps extends Partial<AccordionProps> {
  commentable: Commentable;
}

export const CommentsAccordion = ({
  commentable,
  ...accordionProps
}: CommentsAccordionProps) => {
  const { comments } = useComments(commentable);

  return (
    <Accordion
      title="Comments"
      left={(props) => (
        <MaterialIcons {...props} name="comment" size={SECONDARY_ICON_SIZE} />
      )}
      {...accordionProps}
    >
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} px={3} py={1} />
      ))}

      <Box mx={3} my={2}>
        <CreateCommentField commentable={commentable} />
      </Box>
    </Accordion>
  );
};
