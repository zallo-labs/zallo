import { useEffect, useMemo, useRef } from 'react';
import { makeStyles } from '@theme/makeStyles';
import { Button, Text } from 'react-native-paper';
import { CONTENT_HEIGHT_SNAP_POINT, Sheet } from '~/components/sheet/Sheet';
import { ConfigCard } from './ConfigCard';
import { UserConfig } from 'lib';
import { SectionGrid } from 'react-native-super-grid';
import BottomSheet from '@gorhom/bottom-sheet';
import { AddIcon } from '@theme/icons';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedUser } from '~/queries/user/useUser.api';
import _ from 'lodash';
import {
  ConfigSelectorSection,
  ConfigSelectorSectionHeader,
} from './ConfigSelectorSectionHeader';
import { useUserScreenContext } from '../UserScreenContext';
import { ProposalId } from '~/queries/proposal';

export interface ProposedConfigs {
  configs: UserConfig[];
  proposal?: ProposalId;
}

export interface ConfigSelectorSheetProps {
  user: CombinedUser;
  selected: UserConfig;
  select: (config: UserConfig) => void;
  proposedConfigs?: ProposedConfigs;
}

export const ConfigSelectorSheet = ({
  user,
  selected,
  select,
  proposedConfigs,
}: ConfigSelectorSheetProps) => {
  const styles = useStyles();
  const navigation = useRootNavigation();
  const { sheetShown, setSheetShown } = useUserScreenContext();

  const ref = useRef<BottomSheet>(null);
  const initialSnapPoints = useMemo(() => [CONTENT_HEIGHT_SNAP_POINT], []);

  const sections: ConfigSelectorSection[] = useMemo(
    () =>
      [
        {
          title: 'Active',
          data: user.configs.active ?? [],
        },
        {
          title: 'Proposed',
          data: proposedConfigs?.configs ?? [],
          proposal: proposedConfigs?.proposal,
        },
      ].filter((section) => section.data.length > 0),
    [user.configs, proposedConfigs],
  );

  useEffect(() => {
    if (sheetShown) {
      ref.current?.collapse(); // Expand to min snap point
    } else {
      ref.current?.close();
    }
  }, [sheetShown]);

  return (
    <Sheet
      ref={ref}
      initialSnapPoints={initialSnapPoints}
      style={styles.sheet}
      enablePanDownToClose
      index={-1} // Initial snap point
      onChange={(index) => setSheetShown(index >= 0)}
    >
      <Text variant="titleMedium" style={styles.title}>
        Approval configurations
      </Text>

      <SectionGrid
        sections={sections}
        renderSectionHeader={({ section }) => (
          <ConfigSelectorSectionHeader
            section={section as ConfigSelectorSection}
          />
        )}
        renderItem={({ item }) => (
          <ConfigCard
            config={item}
            selected={_.isEqual(selected, item)}
            style={styles.item}
            onPress={() => {
              setSheetShown(false);
              select(item);
            }}
          />
        )}
        itemContainerStyle={styles.itemContainer}
      />

      <Button
        icon={AddIcon}
        style={styles.create}
        onPress={() =>
          navigation.navigate('Contacts', {
            onMultiSelect: (approvers) => {
              setSheetShown(false);
              select({
                approvers: [...approvers.keys()],
                spendingAllowlisted: false,
                limits: {},
              });
              navigation.goBack();
            },
          })
        }
      >
        Create configuration
      </Button>
    </Sheet>
  );
};

const useStyles = makeStyles(({ space }) => ({
  sheet: {
    paddingHorizontal: space(2),
  },
  title: {
    marginBottom: space(1),
  },
  create: {
    alignSelf: 'flex-start',
    marginBottom: space(1),
  },
  item: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
}));
