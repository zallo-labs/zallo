import { Addr } from '@components/Addr';
import { BoxProps } from '@components/Box';
import { Identicon } from '@components/Identicon';
import { Item } from '@components/list/Item';
import { useCallback, useMemo, useRef, useState } from 'react';
import { LogBox, TouchableOpacity } from 'react-native';
import { Paragraph } from 'react-native-paper';
import { ReactPopover } from './ReactPopover';
import { Reactions } from './Reactions';
import { SwipeToDelete } from '@features/group-management/approver/SwipeToDelete';
import { useDevice } from '@features/device/useDevice';
import { Comment } from '~/queries/useComments.api';
import { useDeleteComment } from '~/mutations/comment/useDeleteComment.api';

LogBox.ignoreLogs(['ViewPropTypes will be removed from React Native']);

export interface CommentItemProps extends BoxProps {
  comment: Comment;
}

export const CommentItem = ({ comment: c, ...boxProps }: CommentItemProps) => {
  const device = useDevice();
  const del = useDeleteComment();

  const ref = useRef<TouchableOpacity>();
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = useCallback(() => del(c), [c, del]);

  const isAuthor = useMemo(
    () => c.author === device.address,
    [c.author, device.address],
  );

  return (
    <SwipeToDelete onDelete={handleDelete} enabled={isAuthor}>
      <Item
        Left={<Identicon seed={c.author} />}
        leftContainer={{ marginRight: 2, justifyContent: 'flex-start' }}
        Main={
          <>
            <TouchableOpacity
              ref={ref as any}
              onLongPress={() => setShowAdd(true)}
            >
              <Paragraph>
                <Paragraph style={{ fontWeight: 'bold' }}>
                  <Addr addr={c.author} />
                </Paragraph>

                {` ${c.content}`}
              </Paragraph>
            </TouchableOpacity>

            <Reactions comment={c} />
          </>
        }
        {...boxProps}
      />

      <ReactPopover
        comment={c}
        from={ref}
        isVisible={showAdd}
        onRequestClose={() => setShowAdd(false)}
      />
    </SwipeToDelete>
  );
};
