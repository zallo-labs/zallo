import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { Popover, PopoverProps } from '@components/Popover';
import { useDevice } from '@features/device/useDevice';
import { Address } from 'lib';
import { useWindowDimensions } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { PopoverPlacement } from 'react-native-popover-view';
import { useReactToComment } from '~/mutations/comment/useReactToComment.api';
import { Comment } from '~/queries/useComments.api';

export const EMOJIS = ['👍', '😄', '❤️', '🚀'];

export const getOwnReactions = (c: Comment, wallet: Address) =>
  c.reactions.find((r) => r.user === wallet)?.emojis ?? [];

export interface ReactPopoverProps extends PopoverProps {
  comment: Comment;
}

export const ReactPopover = ({
  comment: c,
  onRequestClose,
  ...popoverProps
}: ReactPopoverProps) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const device = useDevice();
  const react = useReactToComment();

  const ownEmojies = getOwnReactions(c, device.address);

  const emojis = EMOJIS.filter((emoji) => !ownEmojies.some((e) => e === emoji));

  return (
    <Popover
      {...popoverProps}
      onRequestClose={onRequestClose}
      placement={PopoverPlacement.BOTTOM}
      verticalOffset={-20}
      arrowSize={{ width: 0, height: 0 }}
      popoverStyle={{
        backgroundColor: 'transparent',
        width,
      }}
    >
      <Container
        horizontal
        justifyContent="flex-end"
        separator={<Box ml={1} />}
        mx={4}
      >
        {emojis.map((emoji) => (
          <Chip
            style={{ backgroundColor: colors.primaryContainer }}
            key={emoji}
            onPress={() => {
              react(c, [...ownEmojies, emoji]);
              onRequestClose?.();
            }}
          >
            {emoji}
          </Chip>
        ))}
      </Container>
    </Popover>
  );
};
