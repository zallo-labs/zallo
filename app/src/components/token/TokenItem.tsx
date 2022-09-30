import { makeStyles } from '@theme/makeStyles';
import { Token } from '@token/token';
import { useTokenValue } from '@token/useTokenValue';
import { BigNumber } from 'ethers';
import { Text } from 'react-native-paper';
import { FiatValue } from '../fiat/FiatValue';
import { Item, ItemProps } from '../item/Item';
import { ItemSkeleton } from '../item/ItemSkeleton';
import { withSkeleton } from '../skeleton/withSkeleton';
import { TokenAmount } from './TokenAmount';
import TokenIcon from './TokenIcon/TokenIcon';

export interface TokenItemProps extends ItemProps {
  token: Token;
  amount?: BigNumber;
}

const TokenItem = ({ token, amount, ...itemProps }: TokenItemProps) => {
  const styles = useStyles();
  const fiatValue = useTokenValue(token, amount);

  return (
    <Item
      {...itemProps}
      Left={<TokenIcon token={token} />}
      Main={<Text variant="titleMedium">{token.name}</Text>}
      {...(amount && {
        Right: [
          <Text variant="titleSmall">
            <FiatValue value={fiatValue} />
          </Text>,
          <Text variant="bodyMedium">
            <TokenAmount token={token} amount={amount} />
          </Text>,
        ],
      })}
      style={[styles.root, itemProps.style]}
    />
  );
};

const useStyles = makeStyles(({ space }) => ({
  root: {
    padding: space(2),
  },
}));

export default withSkeleton(TokenItem, ItemSkeleton);
