import { Box, BoxProps } from '@components/Box';
import { PRIMARY_ICON_SIZE } from '@components/list/Item';
import { useMemo, useState } from 'react';
import { Button, Dialog, useTheme } from 'react-native-paper';
import { useSafes } from '~/queries';
import { useSafe, useSafesContext } from '../SafeProvider';
import { SafeItem } from './SafeItem';
import { SelectedSafeItem } from './SelectedSafeItem';

const itemPadding: Partial<BoxProps> = {
  px: 2,
  py: 2,
  mx: 2,
  my: 1,
};

export interface SafeSelectorDialogProps {
  visible: boolean;
  hide: () => void;
}

export const SafeSelectorDialog = ({
  visible,
  hide,
}: SafeSelectorDialogProps) => {
  const { colors } = useTheme();
  const { select, createSafe } = useSafesContext();
  const { safes: allSafes } = useSafes();
  const safe = useSafe();

  const [creatingSafe, setCreatingSafe] = useState(false);

  const otherSafes = useMemo(
    () => allSafes.filter((s) => s.safe.address !== safe.safe.address),
    [allSafes, safe],
  );

  return (
    <Dialog
      visible={visible}
      onDismiss={hide}
      style={{
        display: 'flex',
        backgroundColor: 'transparent',
        marginHorizontal: 0,
        position: 'absolute',
        top: 20,
        width: '100%',
      }}
    >
      <Box backgroundColor={colors.surface} mx={2} py={2}>
        <SelectedSafeItem safe={safe} {...itemPadding} />

        {otherSafes.map((safe) => (
          <SafeItem
            key={safe.safe.address}
            safe={safe}
            onPress={() => {
              select(safe.safe.address);
              hide();
            }}
            {...itemPadding}
          />
        ))}

        <Button
          mode="text"
          labelStyle={{ color: colors.accent }}
          onPress={() => {
            setCreatingSafe(true);
            createSafe();
            // Component unmounts, no need to hide dialog
          }}
          disabled={creatingSafe}
          style={{
            flex: 1,
          }}
          contentStyle={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingHorizontal: 2,
            paddingVertical: 6,
          }}
        >
          <Box width={PRIMARY_ICON_SIZE} ml={1} />
          {creatingSafe ? 'Creating safe...' : 'Create'}
        </Button>
      </Box>
    </Dialog>
  );
};
