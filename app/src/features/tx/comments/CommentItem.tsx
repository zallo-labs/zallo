import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps } from '@components/list/Item';
import { useRef, useState } from 'react';
import { LogBox, Pressable } from 'react-native';
import { Paragraph } from 'react-native-paper';
import { Comment } from '~/queries/useComments';
import { ReactPopover } from './ReactPopover';
import { Reactions } from './Reactions';

LogBox.ignoreLogs(['ViewPropTypes will be removed from React Native']);

export interface CommentItemProps extends ItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment: c, ...itemProps }: CommentItemProps) => {
  const ref = useRef();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Box>
      <Pressable ref={ref} onLongPress={() => setShowAdd(true)}>
        <Item
          Left={<Identicon seed={c.author} />}
          leftContainer={{ marginRight: 2 }}
          Main={
            <Paragraph>
              <Paragraph style={{ fontWeight: 'bold' }}>
                <Addr addr={c.author} />
              </Paragraph>

              {` ${c.content}`}
            </Paragraph>
          }
          {...itemProps}
        />
      </Pressable>

      <Reactions comment={c} />

      <ReactPopover
        comment={c}
        from={ref}
        isVisible={showAdd}
        onRequestClose={() => setShowAdd(false)}
      />
    </Box>
  );
};
