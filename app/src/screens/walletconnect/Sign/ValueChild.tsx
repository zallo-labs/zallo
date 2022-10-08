import { makeStyles } from '@theme/makeStyles';
import { isAddress } from 'lib';
import { useMemo } from 'react';
import { Text } from 'react-native-paper';
import { ExpandOnLongPress } from '~/components/ExpandOnLongPress';
import { Box } from '~/components/layout/Box';
import { useContacts } from '~/queries/contacts/useContacts.api';

export interface ValueChildProps {
  name?: string;
  value: unknown;
}

export const ValueChild = ({ name, value }: ValueChildProps) => {
  const styles = useStyles();
  const [contacts] = useContacts();

  const formatted = useMemo(() => {
    if (typeof value === 'string') {
      const contact =
        isAddress(value) && contacts.find((c) => c.addr === value);
      if (contact) return contact.name;

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

      <ExpandOnLongPress
        collapsed={
          <Text variant="bodyMedium" numberOfLines={2}>
            {formatted}
          </Text>
        }
        expanded={<Text variant="bodyMedium">{formatted}</Text>}
        style={styles.formatted}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  name: {
    marginRight: space(1),
  },
  formatted: {
    flexShrink: 1,
  },
}));
