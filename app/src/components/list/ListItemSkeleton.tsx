import { createStyles, useStyles } from '@theme/styles';
import { CircleSkeleton } from '../skeleton/CircleSkeleton';
import { LineSkeleton } from '../skeleton/LineSkeleton';
import { ListItem, ListItemProps } from './ListItem';
import { ICON_SIZE } from '@theme/paper';

export interface ListItemSkeletonProps
  extends Omit<Partial<ListItemProps>, 'leading' | 'supporting' | 'trailing'> {
  leading?: ListItemProps['leading'] | boolean;
  supporting?: boolean;
  trailing?: boolean;
}

export function ListItemSkeleton({
  leading,
  leadingSize = 'medium',
  supporting,
  trailing,
  ...props
}: ListItemSkeletonProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <ListItem
      leading={leading === true ? <CircleSkeleton size={ICON_SIZE[leadingSize]} /> : leading}
      headline={<LineSkeleton width={140} height={14} />}
      supporting={supporting ? <LineSkeleton width={80} height={12} /> : undefined}
      trailing={trailing ? <LineSkeleton width={40} height={12} /> : undefined}
      containerStyle={styles.item}
      {...props}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
  },
}));
