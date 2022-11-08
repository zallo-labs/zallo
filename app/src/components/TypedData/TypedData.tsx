import { makeStyles } from '@theme/makeStyles';
import { ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { TypedDataValue } from './TypedDataValue';
import { isTypedObject, TypedDataComponent, TypedDataObject } from './TypedDataObject';

export interface TypedDataProps {
  data: TypedDataComponent;
}

export const TypedData = ({ data }: TypedDataProps) => {
  const styles = useStyles();

  return (
    <Card mode="contained">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {isTypedObject(data) ? <TypedDataObject {...data} /> : <TypedDataValue value={data} />}
      </ScrollView>
    </Card>
  );
};

const useStyles = makeStyles(({ space }) => ({
  container: {
    marginVertical: space(1),
    marginLeft: space(1),
    marginRight: space(2),
  },
}));
