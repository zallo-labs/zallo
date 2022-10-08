import { makeStyles } from '@theme/makeStyles';
import assert from 'assert';
import { TypedDataField } from 'ethers';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { ValueChild } from './ValueChild';

export interface ObjectChildProps {
  name?: string;
  value: Record<string, unknown>;
  type: string;
  types: Record<string, TypedDataField[]>;
}

export const ObjectChild = ({ name, value, type, types }: ObjectChildProps) => {
  const styles = useStyles();
  const childrenInfo = types[type];

  return (
    <Box ml={1}>
      <Box horizontal>
        {name ? (
          <>
            <Text variant="labelLarge">{name}</Text>
            <Text variant="bodyMedium">{`: ${type}`}</Text>
          </>
        ) : (
          <Text variant="labelLarge">{type}</Text>
        )}
      </Box>

      {Object.entries(value).map(([fieldName, fieldValue]) => {
        const fieldType = childrenInfo.find(
          (childType) => childType.name === fieldName,
        )?.type;
        assert(fieldType);

        const isObjChild =
          typeof value[fieldName] === 'object' &&
          types[fieldType] !== undefined;

        return isObjChild ? (
          <ObjectChild
            key={fieldName}
            name={fieldName}
            value={fieldValue as Record<string, unknown>}
            type={fieldType}
            types={types}
          />
        ) : (
          <ValueChild key={fieldName} name={fieldName} value={fieldValue} />
        );
      })}
    </Box>
  );
};

const useStyles = makeStyles(({ typoSpace }) => ({
  container: {
    marginVertical: typoSpace(1),
  },
}));
