import { Box } from '~/components/layout/Box';
import { ExpandOnLongPress } from '~/components/ExpandOnLongPress';
import { MethodInput } from './getMethodInputs';
import { makeStyles } from '~/util/theme/makeStyles';
import { useMemo } from 'react';
import { Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';

export interface MethodRowProps extends MethodInput {}

export const MethodInputRow = ({ param, data }: MethodRowProps) => {
  const styles = useStyles();

  const truncatedData = useMemo(
    () => (typeof data === 'string' ? data : JSON.stringify(data)),
    [data],
  );

  const expandedData = useMemo(
    () => (typeof data === 'string' ? data : JSON.stringify(data, null, 2)),
    [data],
  );

  return (
    <Box>
      <Box horizontal justifyContent="space-between" flexWrap="wrap">
        <Text variant="labelLarge">{param.name}</Text>

        <Text variant="bodyMedium">{param.type}</Text>
      </Box>

      <Card
        style={styles.dataContainer}
        touchableStyle={styles.touchableDataContainer}
      >
        <ExpandOnLongPress
          collapsed={
            <Text numberOfLines={1} variant="bodySmall" style={styles.data}>
              {truncatedData}
            </Text>
          }
          expanded={
            <Text variant="bodySmall" style={styles.data}>
              {expandedData}
            </Text>
          }
        />
      </Card>
    </Box>
  );
};

const useStyles = makeStyles(({ colors, space, onBackground, typescale }) => {
  const backgroundColor = colors.surfaceVariant;
  return {
    dataContainer: {
      marginVertical: space(1),
      backgroundColor,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    touchableDataContainer: {
      paddingVertical: space(1),
      paddingHorizontal: space(2),
      display: undefined,
    },
    data: {
      ...typescale.bodySmall,
      color: onBackground(backgroundColor),
    },
  };
});
