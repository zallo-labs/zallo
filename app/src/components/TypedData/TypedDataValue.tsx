import { makeStyles } from '@theme/makeStyles';
import { isAddress, isHex } from 'lib';
import { useMemo } from 'react';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import * as Clipboard from 'expo-clipboard';
import { TouchableOpacity } from 'react-native';
import { useToggle } from '@hook/useToggle';
import { tryDecodeHexString } from '~/util/decodeHex';
import { useContacts } from '@api/contacts';

export interface TypedValue {
  name?: string;
  type?: string;
  value: unknown;
}

export const TypedDataValue = ({ name, value }: TypedValue) => {
  const styles = useStyles();
  const contacts = useContacts();

  const [isExpanded, toggleExpanded] = useToggle(false);

  const formatted = useMemo(() => {
    if (typeof value === 'string') {
      if (isHex(value)) {
        const contact = isAddress(value) && contacts.find((c) => c.addr === value);
        if (contact) return contact.name;

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
