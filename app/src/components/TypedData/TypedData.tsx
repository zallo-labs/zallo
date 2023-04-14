import { ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { TypedDataValue } from './TypedDataValue';
import { isTypedObject, TypedDataComponent, TypedDataObject } from './TypedDataObject';
import { StyleSheet } from 'react-native';

export interface TypedDataProps {
  data: TypedDataComponent;
}

export const TypedData = ({ data }: TypedDataProps) => {
  return (
    <Card mode="contained">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {isTypedObject(data) ? <TypedDataObject {...data} /> : <TypedDataValue value={data} />}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginLeft: 8,
    marginRight: 16,
  },
});
