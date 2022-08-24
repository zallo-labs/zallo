import { Box } from '~/components/layout/Box';
import { ExpandOnLongPress } from '~/components/ExpandOnLongPress';
import { elipseTruncate } from '~/util/format';
import { MethodInput } from '~/screens/transaction/details/getMethodInputs';
import { makeStyles } from '~/util/theme/makeStyles';
import { useMemo } from 'react';
import { Text } from 'react-native-paper';

export interface MethodRowProps extends MethodInput {}

export const MethodInputRow = ({ param, data }: MethodRowProps) => {
  const styles = useStyles();

  const truncatedData = useMemo(
    () => elipseTruncate(JSON.stringify(data), 6),
    [data],
  );

  const expandedData = useMemo(() => JSON.stringify(data, null, 4), [data]);

  return (
    <ExpandOnLongPress
      collapsed={
        <Box horizontal justifyContent="space-between" flexWrap="wrap">
          <Text variant="labelLarge">{param.name}</Text>

          <Box ml={3}>
            <Text variant="bodySmall">{truncatedData}</Text>
          </Box>
        </Box>
      }
      expanded={
        <Box vertical>
          <Box horizontal justifyContent="space-between" flexWrap="wrap">
            <Text variant="labelLarge">{param.name}</Text>

            <Text variant="bodyMedium">{param.type}</Text>
          </Box>

          <Text variant="bodySmall" style={styles.expandedData}>
            {expandedData}
          </Text>
        </Box>
      }
    />
  );
};

const useStyles = makeStyles(({ space }) => ({
  expandedData: {
    marginLeft: space(3),
  },
}));
