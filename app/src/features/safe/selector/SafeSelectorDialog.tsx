import { Box, BoxProps } from '@components/Box';
import { space } from '@util/theme/styledComponents';
import { useMemo, useState } from 'react';
import { Button, Dialog, useTheme } from 'react-native-paper';
import { useSafes } from '~/queries/useSafes';
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
  const { colors, iconSize } = useTheme();
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
        position: 'absolute',
        top: 20,
        width: '100%',
        backgroundColor: undefined,
        marginHorizontal: 0,
      }}
    >
      <Box surface rounded mx={1} py={2}>
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
            paddingHorizontal: space(3),
            paddingVertical: space(2),
          }}
        >
          <Box width={iconSize.medium} ml={1} />
          {creatingSafe ? 'Creating safe...' : 'Create'}
        </Button>
      </Box>
    </Dialog>
  );
};
