import { UAddress } from 'lib';
import { useAddressLabel } from '#/address/AddressLabel';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';
import { I18nManager } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { CloseIcon, DeleteIcon } from '@theme/icons';
import { useRef } from 'react';
import { ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { AddressIcon } from '#/Identicon/AddressIcon';

export interface ApproverItemProps extends Partial<ListItemProps> {
  address: UAddress;
  remove: () => void;
}

export function ApproverItem({ address, remove, ...props }: ApproverItemProps) {
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
        leading={<AddressIcon address={address} />}
        headline={label}
        supporting={label !== truncated ? truncated : undefined}
        trailing={<CloseIcon onPress={remove} />}
        containerStyle={styles.itemContainer}
        {...props}
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
