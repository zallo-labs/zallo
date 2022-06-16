import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { useWallet } from '@features/wallet/useWallet';
import { Address } from 'lib';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { Caption, Chip } from 'react-native-paper';
import { useReactToComment } from '~/mutations/comment/useReactToComment';
import { Comment } from '~/queries/useComments';
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
  const wallet = useWallet();
  const react = useReactToComment();

  const emojis: GroupedEmoji[] = useMemo(() => {
    const allReactions = comment.reactions.flatMap((r) =>
      r.emojis.map((emoji) => ({ emoji, approver: r.approver })),
    );

    const grouped = Object.entries(_.groupBy(allReactions, (e) => e.emoji));
    const sorted = _.sortBy(grouped, ([emoji]) => EMOJIS.indexOf(emoji));

    return Object.values(sorted).map(([emoji, grouped]) => {
      const approvers = grouped.map((g) => g.approver);
      const userHasApproved = approvers.includes(wallet.address);

      return { emoji, approvers, userHasApproved };
    });
  }, [comment.reactions, wallet.address]);

  const handlePress = useCallback(
    ({ emoji, userHasApproved }: GroupedEmoji) => {
      const ownEmojis = getOwnReactions(comment, wallet.address);

      const newEmojis = userHasApproved
        ? ownEmojis.filter((e) => e !== emoji)
        : [...ownEmojis, emoji];

      react(comment, newEmojis);
    },
    [comment, wallet.address, react],
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
