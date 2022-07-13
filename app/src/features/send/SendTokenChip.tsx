import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { TokenIcon } from '@components/token/TokenIcon';
import { TokenValue } from '@components/token/TokenValue';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { SendScreenProps } from './SendScreen';

export interface SendTokenChipProps {
  token: Token;
}

export const SendTokenChip = ({ token }: SendTokenChipProps) => {
  const navigation = useNavigation<SendScreenProps['navigation']>();
  const balance = useTokenBalance(token);

  return (
    <Card style={{ borderRadius: 10 }}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SelectToken', {
            target: {
              route: 'Send',
              output: 'token',
            },
          })
        }
      >
        <Container
          horizontal
          alignItems="center"
          m={2}
          separator={<Box mx={1} />}
        >
          <TokenIcon token={token} size={40} />

          <Title>
            <TokenValue token={token} value={balance} noSymbol />
          </Title>

          <Title style={{ opacity: 0.8 }}>{token.symbol}</Title>
        </Container>
      </TouchableOpacity>
    </Card>
  );
};
