import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Duration } from 'luxon';

import { Address, asDecimal, TransferLimit } from 'lib';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { ListItem } from '~/components/list/ListItem';
import { ListItemHorizontalTrailing } from '~/components/list/ListItemHorizontalTrailing';
import { ListItemTrailingText } from '~/components/list/ListItemTrailingText';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { TokenIcon } from '~/components/token/TokenIcon';
import { FragmentType, useFragment as getFragment, gql } from '~/gql/api';
import { usePolicyDraftState } from '~/lib/policy/draft';
import { truncateAddr } from '~/util/format';
import { NavigateNextIcon } from '~/util/theme/icons';

const Token = gql(/* GraphQL */ `
  fragment TokenLimitItem_Token on Token {
    name
    decimals
    ...TokenIcon_Token
    ...UseFormattedTokenAmount_token
  }
`);

export interface TokenSpendingProps {
  address: Address;
  token: FragmentType<typeof Token> | null | undefined;
}

export function TokenLimitItem({ address, ...props }: TokenSpendingProps) {
  const token = getFragment(Token, props.token);
  const router = useRouter();
  const [policy] = usePolicyDraftState();

  const limit: TransferLimit | undefined = policy.transfers.limits[address];
  // TODO: make limit.amount a decimal
  const formattedAmount = useFormattedTokenAmount({
    token,
    amount: token && limit ? asDecimal(limit.amount, token?.decimals) : 0,
  });
  const duration = Duration.fromObject({ seconds: limit?.duration ?? 0 });

  return (
    <ListItem
      leading={(props) =>
        token ? (
          <TokenIcon token={token} {...props} />
        ) : (
          <AddressIcon address={address} {...props} />
        )
      }
      headline={token?.name ?? truncateAddr(address)}
      trailing={(props) => (
        <ListItemHorizontalTrailing>
          <ListItemTrailingText>
            {!limit?.amount ? 'Not allowed' : `${formattedAmount} per ${prettyDuration(duration)}`}
          </ListItemTrailingText>
          <NavigateNextIcon {...props} />
        </ListItemHorizontalTrailing>
      )}
      onPress={() =>
        router.push({
          pathname: `/(drawer)/[account]/policies/[key]/spending/[token]`,
          params: { account: policy.account, key: policy.key ?? 'add', token: address },
        })
      }
    />
  );
}

function prettyDuration(duration: Duration) {
  const normalized = Duration.fromDurationLike(duration)
    .normalize()
    .shiftTo('years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds');

  const minified = _.pickBy(normalized.toObject(), (v) => v !== 0);
  if (Object.keys(minified).length === 1 && Object.values(minified)[0] === 1) {
    const unit = Object.keys(minified)[0];
    return unit.endsWith('s') ? unit.slice(0, unit.length - 1) : unit;
  }

  return Duration.fromObject(minified).toHuman();
}
