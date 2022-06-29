import { Accordion, AccordionProps } from '@components/Accordion';
import { Box } from '@components/Box';
import { MaterialIcons } from '@expo/vector-icons';
import { Commentable, useComments } from '~/queries/useComments';
import { CreateCommentField } from './CreateCommentField';
import { CommentItem } from './CommentItem';
import { useTheme } from 'react-native-paper';

export interface CommentsAccordionProps extends Partial<AccordionProps> {
  commentable: Commentable;
}

export const CommentsAccordion = ({
  commentable,
  ...accordionProps
}: CommentsAccordionProps) => {
  const { iconSize } = useTheme();
  const { comments } = useComments(commentable);

  return (
    <Accordion
      title="Comments"
      left={(props) => (
        <MaterialIcons {...props} name="comment" size={iconSize.small} />
      )}
      {...accordionProps}
    >
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} px={3} my={2} />
      ))}

      <Box mx={3}>
        <CreateCommentField commentable={commentable} />
      </Box>
    </Accordion>
  );
};
