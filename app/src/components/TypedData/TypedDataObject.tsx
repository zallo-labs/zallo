import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { TypedDataValue, TypedValue } from './TypedDataValue';

export type TypedDataComponent = TypedObject | TypedValue;

export interface TypedObject {
  name?: string;
  type?: string;
  components: TypedDataComponent[];
}

export const isTypedObject = (v: TypedDataComponent): v is TypedObject =>
  typeof v === 'object' && v !== null && 'components' in v && Array.isArray(v.components);

export interface TypedDataObjectProps extends TypedObject {}

export const TypedDataObject = ({ name, type, components }: TypedDataObjectProps) => {
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

      {components.map((c) =>
        isTypedObject(c) ? (
          <TypedDataObject key={c.name} {...c} />
        ) : (
          <TypedDataValue key={c.name} {...c} />
        ),
      )}
    </Box>
  );
};
