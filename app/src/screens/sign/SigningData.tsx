import { makeStyles } from '@theme/makeStyles';
import { ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { TypedData } from '~/util/walletconnect/methods/signing';
import { ObjectChild } from './ObjectChild';
import { ValueChild } from './ValueChild';

export interface SigningDataProps {
  data: string | TypedData;
}

export const SigningData = ({ data }: SigningDataProps) => {
  const styles = useStyles();
  return (
    <Card mode="contained">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {typeof data === 'string' ? (
          <ValueChild value={data} />
        ) : (
          <ObjectChild
            value={data.message}
            type={data.primaryType}
            types={data.types}
          />
        )}
      </ScrollView>
    </Card>
  );
};

const useStyles = makeStyles(({ space }) => ({
  container: {
    marginVertical: space(1),
    marginHorizontal: space(2),
  },
}));
