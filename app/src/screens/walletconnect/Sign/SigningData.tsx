import { Card } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { TypedData } from '~/util/walletconnect/methods/signing';
import { ObjectChild } from './ObjectChild';
import { ValueChild } from './ValueChild';

export interface SigningDataProps {
  data: string | TypedData;
}

export const SigningData = ({ data }: SigningDataProps) => {
  return (
    <Card mode="contained">
      {/* Children already have ml={1} */}
      <Box ml={1} mr={2} my={1}>
        {typeof data === 'string' ? (
          <ValueChild value={data} />
        ) : (
          <ObjectChild
            value={data.message}
            type={data.primaryType}
            types={data.types}
          />
        )}
      </Box>
    </Card>
  );
};
