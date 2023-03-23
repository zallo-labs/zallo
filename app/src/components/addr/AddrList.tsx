import { Address } from 'lib';
import { Text } from 'react-native-paper';
import { Box } from '../layout/Box';
import { Container } from '../layout/Container';
import { AddressLabel } from './AddressLabel';

export interface AddrListProps {
  addresses: Address[];
}

export const AddrList = ({ addresses }: AddrListProps) => (
  <Container flex={1} horizontal alignItems="center" flexWrap="wrap" separator={<Box ml={2} />}>
    {addresses.map((addr) => (
      <Text key={addr} variant="bodyMedium">
        <AddressLabel address={addr} />
      </Text>
    ))}
  </Container>
);
