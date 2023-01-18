import { useToken } from '@token/useToken';
import { ListItem } from '~/components/list/ListItem';
import { TokenAmount } from '~/components/token/TokenAmount';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { useQuorumDraft } from '../QuorumDraftProvider';
import { TokenLimitScreenParams } from './limit/TokenLimitScreen';

export interface TokenLimitItemProps extends TokenLimitScreenParams {}

export const TokenLimitItem = (props: TokenLimitItemProps) => {
  const { navigate } = useRootNavigation();
  const token = useToken(props.token);
  const limit = useQuorumDraft().state.spending!.limits[token.addr];

  return (
    <ListItem
      leading={token.addr}
      headline={token.name}
      supporting={token.symbol}
      trailing={
        <>
          <TokenAmount token={token} amount={limit.amount} trailing={false} />
          {` /${limit.period.toLowerCase()}`}
        </>
      }
      onPress={() => navigate('TokenLimit', props)}
    />
  );
};
