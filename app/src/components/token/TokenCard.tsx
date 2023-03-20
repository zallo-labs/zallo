import { Text } from 'react-native-paper';
import { CardItem, CardItemProps } from '../card/CardItem';
import { Token } from '@token/token';
import { TokenIcon } from './TokenIcon/TokenIcon';

export interface TokenCardProps extends CardItemProps {
  token: Token;
}

export const TokenCard = ({ token: t, ...itemProps }: TokenCardProps) => (
  <CardItem
    Left={<TokenIcon token={t} />}
    Main={<Text variant="titleMedium">{t.name}</Text>}
    {...itemProps}
  />
);
