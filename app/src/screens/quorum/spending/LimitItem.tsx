import { useToken } from '@token/useToken';
import { ListItem } from '~/components/ListItem/ListItem';
import { TokenAmount } from '~/components/token/TokenAmount';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { TokenLimitScreenParams } from './limit/TokenLimitScreen';

export interface LimitItemProps extends TokenLimitScreenParams {}

export const LimitItem = (props: LimitItemProps) => {
  const { navigate } = useRootNavigation();
  const { limit } = props;
  const token = useToken(limit.token);

  return (
    <ListItem
      leading={limit.token}
      headline={token.name}
      supporting={token.symbol}
      trailing={
        <>
          <TokenAmount token={token} amount={limit.amount} symbol={false} />
          {` /${limit.period.toLowerCase()}`}
        </>
      }
      onPress={() => navigate('TokenLimit', props)}
    />
  );
};
