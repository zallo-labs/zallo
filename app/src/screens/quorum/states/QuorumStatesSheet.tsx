import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { makeStyles } from '@theme/makeStyles';
import { isPresent } from 'lib';
import _ from 'lodash';
import { useRef, useEffect, useMemo } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { Sheet } from '~/components/sheet/Sheet';
import { isRemoval } from '~/queries/quroum';
import { useQuorumDraft } from '../QuorumDraftProvider';
import { StateItem } from './StateItem';

export interface QuorumStatesSheetProps {
  sheetShown: boolean;
  setSheetShown: (shown: boolean) => void;
}

export const QuorumStatesSheet = ({ sheetShown, setSheetShown }: QuorumStatesSheetProps) => {
  const styles = useStyles();
  const { navigate } = useNavigation();
  const { quorum, initState: proposedState } = useQuorumDraft();

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
            selected={_.isEqual(item.proposal, proposedState.proposal)}
            select={
              isRemoval(item)
                ? undefined
                : () => {
                    navigate('Quorum', {
                      quorum,
                      initState: item,
                    });
                    setSheetShown(false);
                  }
            }
            isActiveState={_.isEqual(item, quorum.active)}
          />
        )}
      />
    </Sheet>
  );
};

const useStyles = makeStyles(({ colors, s }) => ({
  sectionHeader: {
    color: colors.onSurfaceVariant,
    marginBottom: s(8),
    marginHorizontal: s(16),
  },
}));
