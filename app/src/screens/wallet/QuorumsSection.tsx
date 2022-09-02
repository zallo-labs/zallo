import { PlusIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import assert from 'assert';
import produce from 'immer';
import { hashQuorum, Address, toQuorum } from 'lib';
import { useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Accordion } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedQuorum, sortCombinedQuorums } from '~/queries/wallets';
import { QuorumCard } from './QuorumCard';

export interface QuorumsSectionProps {
  initialQuorums: CombinedQuorum[];
  quorums: CombinedQuorum[];
  setQuorums: (f: (quorums: CombinedQuorum[]) => CombinedQuorum[]) => void;
  style?: StyleProp<ViewStyle>;
}

export const QuorumsSection = ({
  initialQuorums,
  quorums,
  setQuorums,
  style,
}: QuorumsSectionProps) => {
  const styles = useStyles();
  const { navigate } = useRootNavigation();

  const makeRemoveQuorum = useCallback(
    (quorum: CombinedQuorum) => {
      if (quorum.state.status === 'remove') return undefined;

      return () =>
        setQuorums((quorums) =>
          produce(quorums, (quorums) => {
            const i = quorums.findIndex(
              (q) => hashQuorum(q.approvers) === hashQuorum(quorum.approvers),
            );

            if (quorum.state.status === 'active') {
              quorums[i].state.status = 'remove';
            } else {
              assert(quorum.state.status === 'add');
              quorums.splice(i, 1);
            }
          }),
        );
    },
    [setQuorums],
  );

  const addQuorum = useCallback(
    (approvers: Address[]) => {
      setQuorums((quorums) =>
        produce(quorums, (quorums) => {
          const quorum = toQuorum(approvers);
          const hash = hashQuorum(quorum);

          if (!quorums.find((q) => hash === hashQuorum(q.approvers))) {
            return sortCombinedQuorums([
              ...quorums,
              {
                approvers: toQuorum(approvers),
                state: { status: 'add' },
              },
            ]);
          }
        }),
      );
    },
    [setQuorums],
  );

  const makeSetQuorumApprovers = useCallback(
    (quorum: CombinedQuorum) => (approvers: Address[]) => {
      makeRemoveQuorum(quorum)?.();
      addQuorum(approvers);
    },
    [addQuorum, makeRemoveQuorum],
  );

  const makeRevertQuorum = useCallback(
    (quorum: CombinedQuorum) => {
      // Revert quorum to initial state if it pre-existed
      const initialIndex = initialQuorums.findIndex(
        (q) => hashQuorum(q.approvers) === hashQuorum(quorum.approvers),
      );

      // Quorum can't be reverted if there is no initial state, or it hasn't changed
      const initial = initialQuorums[initialIndex];
      if (!initial || initial === quorum) return undefined;

      return () => {
        const i = quorums.findIndex(
          (q) => hashQuorum(q.approvers) === hashQuorum(quorum.approvers),
        );
        assert(i >= 0);

        setQuorums((quorums) =>
          produce(quorums, (quorums) => {
            quorums[i] = initial;
          }),
        );
      };
    },
    [initialQuorums, quorums, setQuorums],
  );

  return (
    <Accordion
      title={<Text variant="titleSmall">Quorums</Text>}
      initiallyExpanded
      style={style}
    >
      <Container separator={<Box mt={2} />}>
        {quorums.map((quorum) => (
          <QuorumCard
            key={hashQuorum(quorum.approvers)}
            quorum={quorum}
            onPress={() => {
              navigate('Quorum', {
                approvers: quorum.approvers,
                onChange: makeSetQuorumApprovers(quorum),
                revertQuorum: makeRevertQuorum(quorum),
                removeQuorum:
                  quorum.state.status !== 'remove'
                    ? makeRemoveQuorum(quorum)
                    : undefined,
                state: quorum.state,
              });
            }}
          />
        ))}

        <Button
          icon={PlusIcon}
          style={styles.end}
          onPress={() =>
            navigate('Quorum', {
              onChange: addQuorum,
              state: { status: 'add' },
            })
          }
        >
          Quorum
        </Button>
      </Container>
    </Accordion>
  );
};

const useStyles = makeStyles(({ space }) => ({
  end: {
    alignSelf: 'flex-end',
  },
}));
