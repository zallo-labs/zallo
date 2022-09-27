import { makeStyles } from '@theme/makeStyles';
import { Address } from 'lib';
import { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { useContact } from '~/queries/contacts/useContact';
import { elipseTruncate } from '~/util/format';
import { Identicon } from '../Identicon/Identicon';
import { Box } from '../layout/Box';

export interface AddrItemProps {
  addr: Address;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AddrItem = ({ addr, onPress, style }: AddrItemProps) => {
  const styles = useStyles();
  const contact = useContact(addr);

  const truncatedAddr = useMemo(() => elipseTruncate(addr, 6, 4), [addr]);

  return (
    <TouchableRipple onPress={onPress}>
      <Box horizontal alignItems="center" style={style}>
        <Identicon seed={addr} style={styles.icon} />

        <Text variant="titleMedium" style={styles.label}>
          {contact?.name ?? truncatedAddr}
        </Text>

        {contact && <Text variant="bodyMedium">{truncatedAddr}</Text>}
      </Box>
    </TouchableRipple>
  );
};

const useStyles = makeStyles(({ space }) => ({
  icon: {
    marginRight: space(2),
  },
  label: {
    flex: 1,
  },
}));
