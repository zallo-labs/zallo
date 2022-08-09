import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { useDevice } from '@features/device/useDevice';
import { Address } from 'lib';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { Caption, Chip } from 'react-native-paper';
import { useReactToComment } from '~/mutations/comment/useReactToComment.api';
import { Comment } from '~/queries/useComments.api';
import { EMOJIS, getOwnReactions } from './ReactPopover';

type GroupedEmoji = {
  emoji: string;
  approvers: Address[];
  userHasApproved: boolean;
};

export interface ReactionsProps {
  comment: Comment;
  verticalOffset?: number;
}

export const Reactions = ({ comment, verticalOffset }: ReactionsProps) => {
  const device = useDevice();
  const react = useReactToComment();

  const emojis: GroupedEmoji[] = useMemo(() => {
    const allReactions = comment.reactions.flatMap((r) =>
      r.emojis.map((emoji) => ({ emoji, approver: r.user })),
    );

    const grouped = Object.entries(_.groupBy(allReactions, (e) => e.emoji));
    const sorted = _.sortBy(grouped, ([emoji]) => EMOJIS.indexOf(emoji));

    return Object.values(sorted).map(([emoji, grouped]) => {
      const approvers = grouped.map((g) => g.approver);
      const userHasApproved = approvers.includes(device.address);

      return { emoji, approvers, userHasApproved };
    });
  }, [comment.reactions, device.address]);

  const handlePress = useCallback(
    ({ emoji, userHasApproved }: GroupedEmoji) => {
      const ownEmojis = getOwnReactions(comment, device.address);

      const newEmojis = userHasApproved
        ? ownEmojis.filter((e) => e !== emoji)
        : [...ownEmojis, emoji];

      react(comment, newEmojis);
    },
    [comment, device.address, react],
  );

  return (
    <Container
      horizontal
      justifyContent="flex-end"
      separator={<Box ml={1} />}
      mx={4}
    >
      {emojis.map((g) => (
        <Box key={g.emoji}>
          <Chip
            style={{ marginTop: verticalOffset }}
            selected={g.userHasApproved}
            onPress={() => handlePress(g)}
          >
            {g.emoji}
            {g.approvers.length > 1 && (
              <Caption>{` ${g.approvers.length}`}</Caption>
            )}
          </Chip>
        </Box>
      ))}
    </Container>
  );
};
