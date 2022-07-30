import { TokenIcon } from '@components/token/TokenIcon';
import { Text } from 'react-native-paper';
import { Token } from '~/token/token';
import { CardItem } from '../card/CardItem';

export interface TokenCardProps {
  token: Token;
}

export const TokenCard = ({ token: t }: TokenCardProps) => (
  <CardItem
    Left={<TokenIcon token={t} />}
    Main={<Text variant="titleMedium">{t.name}</Text>}
  />
);
