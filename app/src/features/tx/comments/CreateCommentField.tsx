import { SheetTextField } from '@components/fields/SheetTextField';
import { useState, useCallback } from 'react';
import { TextInput, useTheme } from 'react-native-paper';
import { useCreateComment } from '~/mutations/comment/useCreateComment.api';
import { Commentable } from '~/queries/useComments.api';

export interface CreateCommentFieldProps {
  commentable: Commentable;
}

export const CreateCommentField = ({
  commentable,
}: CreateCommentFieldProps) => {
  const { colors } = useTheme();
  const create = useCreateComment(commentable);

  const [content, setContent] = useState('');
  const handleSubmit = useCallback(() => {
    if (content) {
      create(content);
      setContent('');
    }
  }, [create, content]);

  return (
    <SheetTextField
      value={content}
      onChangeText={setContent}
      label="Comment"
      style={{ backgroundColor: colors.surface }}
      multiline
      right={
        <TextInput.Icon
          name="send"
          onPress={handleSubmit}
          disabled={!content}
          forceTextInputFocus={false}
        />
      }
    />
  );
};
