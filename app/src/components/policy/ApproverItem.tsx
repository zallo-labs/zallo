import { UAddress } from 'lib';
import { useAddressLabel } from '#/address/AddressLabel';
import { ListItem } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';
import { I18nManager } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { DeleteIcon } from '@theme/icons';
import { useRef } from 'react';
import { ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';

export interface ApproverItemProps {
  address: UAddress;
  remove: () => void;
}

export function ApproverItem({ address, remove }: ApproverItemProps) {
  const { styles } = useStyles(stylesheet);
  const label = useAddressLabel(address);
  const truncated = truncateAddr(address);

  const ref = useRef<Swipeable | null>(null);

  const handleRightPress = () => {
    // ref.current?.close();    // Causes `Maximum call stack size exceeded` on web
    remove();
  };

  return (
    <Swipeable
      ref={ref}
      overshootRight
      overshootFriction={8}
      renderRightActions={(progress) => {
        progress.addListener((state: { value: number }) => {
          if (state.value === 1) handleRightPress();
        });

        return (
          <RectButton style={styles.deleteActionContainer} onPress={handleRightPress}>
            <DeleteIcon size={ICON_SIZE.small} style={styles.deleteAction} />
          </RectButton>
        );
      }}
    >
      <ListItem
        leading={address}
        headline={label}
        trailing={label !== truncated ? truncated : undefined}
        containerStyle={styles.itemContainer}
      />
    </Swipeable>
  );
}
const stylesheet = createStyles(({ colors }) => ({
  itemContainer: {
    backgroundColor: colors.surface,
  },
  deleteActionContainer: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: colors.errorContainer,
  },
  deleteAction: {
    color: colors.onErrorContainer,
    marginRight: 16,
  },
}));
