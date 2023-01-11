import BottomSheet from '@gorhom/bottom-sheet';
import { makeStyles } from '@theme/makeStyles';
import { isPresent, isTruthy, Quorum } from 'lib';
import _ from 'lodash';
import { useRef, useEffect, useMemo } from 'react';
import { FlatList, SectionList } from 'react-native';
import { Text } from 'react-native-paper';
import { Sheet } from '~/components/sheet/Sheet';
import { CombinedQuorum, isRemoval, Proposable } from '~/queries/quroum';
import { StateItem } from './StateItem';

export interface QuorumStatesSheetProps {
  quorum: CombinedQuorum;
  proposedState: Proposable<Quorum>;
  setState: (state: Proposable<Quorum>) => void;
  sheetShown: boolean;
  setSheetShown: (shown: boolean) => void;
}

export const QuorumStatesSheet = ({
  quorum,
  proposedState,
  setState,
  sheetShown,
  setSheetShown,
}: QuorumStatesSheetProps) => {
  const styles = useStyles();

  const ref = useRef<BottomSheet>(null);

  useEffect(() => {
    if (sheetShown) {
      ref.current?.collapse(); // Expand to min snap point
    } else {
      ref.current?.close();
    }
  }, [sheetShown]);

  const data = useMemo(
    () => [quorum.active, ...quorum.proposals].filter(isPresent),
    [quorum.active, quorum.proposals],
  );

  return (
    <Sheet ref={ref} index={-1} onChange={(index) => setSheetShown(index >= 0)} handle={false}>
      <FlatList
        data={data}
        ListHeaderComponent={
          <Text variant="bodyLarge" style={styles.sectionHeader}>
            Quorum states
          </Text>
        }
        keyExtractor={(q) => q.proposal?.id || ''}
        renderItem={({ item }) => (
          <StateItem
            state={item}
            selected={_.isEqual(item, proposedState)}
            select={
              isRemoval(item)
                ? undefined
                : () => {
                    setState(item);
                    setSheetShown(false);
                  }
            }
            isActiveState={_.isEqual(item, quorum.active)}
          />
        )}
        contentContainerStyle={styles.container}
      />
    </Sheet>
  );
};

const useStyles = makeStyles(({ colors, s }) => ({
  container: {
    // marginBottom: s(8),
  },
  sectionHeader: {
    color: colors.onSurfaceVariant,
    marginBottom: s(8),
    marginHorizontal: s(16),
  },
}));
