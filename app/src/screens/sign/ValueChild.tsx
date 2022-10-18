import { makeStyles } from '@theme/makeStyles';
import { isAddress } from 'lib';
import { useMemo } from 'react';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { useContacts } from '~/queries/contacts/useContacts.api';
import * as Clipboard from 'expo-clipboard';
import { TouchableOpacity } from 'react-native';
import { useToggle } from '@hook/useToggle';
import { isHexString } from 'ethers/lib/utils';
import { tryDecodeHexString } from '~/util/decodeHex';

export interface ValueChildProps {
  name?: string;
  value: unknown;
}

export const ValueChild = ({ name, value }: ValueChildProps) => {
  const styles = useStyles();
  const [contacts] = useContacts();

  const [isExpanded, toggleExpanded] = useToggle(false);

  const formatted = useMemo(() => {
    if (typeof value === 'string') {
      const contact =
        isAddress(value) && contacts.find((c) => c.addr === value);
      if (contact) return contact.name;

      if (isHexString(value)) {
        const decoded = tryDecodeHexString(value);
        if (decoded) return decoded;
      }

      return value;
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      typeof value.toString === 'function' &&
      value.toString !== Object.prototype.toString
    ) {
      return value.toString();
    }

    return JSON.stringify(value);
  }, [contacts, value]);

  return (
    <Box horizontal ml={1}>
      {name && (
        <Text variant="labelLarge" style={styles.name}>
          {name}
        </Text>
      )}

      <TouchableOpacity
        onPress={toggleExpanded}
        onLongPress={() => Clipboard.setStringAsync(formatted)}
      >
        {isExpanded ? (
          <Text variant="bodyMedium">{formatted}</Text>
        ) : (
          <Text variant="bodyMedium" numberOfLines={2}>
            {formatted}
          </Text>
        )}
      </TouchableOpacity>
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  name: {
    marginRight: space(2),
  },
  formatted: {
    flexShrink: 1,
  },
}));
