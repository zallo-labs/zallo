import { Paragraph, Subheading } from 'react-native-paper';

import { ListItem } from '@components/ListItem/ListItem';
import { Token } from './token';
import { TokenIcon } from './TokenIcon';
import { TokenValue } from './TokenValue';
import { useTokenBalance } from './useTokenBalance';

export interface TokenItemProps {
  token: Token;
}

export const TokenItem = ({ token: t }: TokenItemProps) => {
  const balance = useTokenBalance(t);

  return (
    <ListItem
      Left={<TokenIcon token={t} />}
      Main={<Subheading>{t.name}</Subheading>}
      Right={
        <TokenValue token={t} value={balance}>
          {({ value }) => <Paragraph>{value}</Paragraph>}
        </TokenValue>
      }
    />
  );
};
