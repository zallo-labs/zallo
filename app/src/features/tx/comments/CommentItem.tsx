import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps } from '@components/list/Item';
import { useCallback, useMemo, useRef, useState } from 'react';
import { LogBox, Pressable } from 'react-native';
import { Paragraph } from 'react-native-paper';
import { Comment } from '~/queries/useComments';
import { ReactPopover } from './ReactPopover';
import { Reactions } from './Reactions';
import { useDeleteComment } from '~/mutations/comment/useDeleteComment';
import { SwipeToDelete } from '@features/group-management/approver/SwipeToDelete';
import { useWallet } from '@features/wallet/useWallet';

LogBox.ignoreLogs(['ViewPropTypes will be removed from React Native']);

export interface CommentItemProps extends ItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment: c, ...itemProps }: CommentItemProps) => {
  const wallet = useWallet();
  const del = useDeleteComment();

  const ref = useRef();
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = useCallback(() => del(c), [c, del]);

  const isAuthor = useMemo(
    () => c.author === wallet.address,
    [c.author, wallet.address],
  );

  return (
    <SwipeToDelete onDelete={handleDelete} enabled={isAuthor}>
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
    </SwipeToDelete>
  );
};
