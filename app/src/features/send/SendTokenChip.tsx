import { Box } from '@components/Box';
import { TokenIcon } from '@components/token/TokenIcon';
import { TokenValue } from '@components/token/TokenValue';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Card, Headline, Title } from 'react-native-paper';
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
        <Box horizontal alignItems="center" m={2}>
          <TokenIcon token={token} size={30} />

          <Headline>{` ${token.symbol}  `}</Headline>

          <Title style={{ opacity: 0.8 }}>
            <TokenValue token={token} value={balance} noSymbol />
          </Title>
        </Box>
      </TouchableOpacity>
    </Card>
  );
};
